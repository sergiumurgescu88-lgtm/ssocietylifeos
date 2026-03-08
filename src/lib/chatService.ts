type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface StreamChatOptions {
  messages: Msg[];
  contextData?: Record<string, any>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export async function streamChat({ messages, contextData, onDelta, onDone, onError, signal }: StreamChatOptions) {
  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          contextData,
        }),
        signal,
      });

      if (resp.status === 429) {
        onError("Prea multe cereri. Încearcă din nou în câteva secunde.");
        return;
      }
      if (resp.status === 402) {
        onError("Credit AI insuficient. Adaugă fonduri în setări.");
        return;
      }

      if (!resp.ok) {
        if (resp.status >= 500 && retries < maxRetries) {
          retries++;
          await new Promise((r) => setTimeout(r, 1000 * retries));
          continue;
        }
        const body = await resp.json().catch(() => ({}));
        onError(body.error || "Ceva nu a mers bine. Încearcă din nou.");
        return;
      }

      if (!resp.body) {
        onError("No response body");
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {}
        }
      }

      onDone();
      return;
    } catch (e: any) {
      if (e.name === "AbortError") return;
      if (retries < maxRetries) {
        retries++;
        await new Promise((r) => setTimeout(r, 1000 * retries));
      } else {
        onError("Conexiune eșuată. Verifică internetul și încearcă din nou.");
        return;
      }
    }
  }
}
