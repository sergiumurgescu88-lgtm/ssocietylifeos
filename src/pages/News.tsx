import { useState, useEffect, useCallback, memo } from "react";
import {
  Newspaper, ExternalLink, Bookmark, BookmarkCheck, Filter, Clock,
} from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Article {
  title: string;
  source: { name: string };
  publishedAt: string;
  urlToImage: string | null;
  url: string;
  description: string | null;
}

const categories = [
  { id: "general", label: "General" },
  { id: "technology", label: "Tech" },
  { id: "health", label: "Health" },
  { id: "business", label: "Finance" },
];

const READ_LATER_KEY = "lifeos_read_later";

function getReadLater(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_LATER_KEY) || "[]");
  } catch {
    return [];
  }
}

function NewsPageInner() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("general");
  const [readLater, setReadLater] = useState<string[]>(getReadLater());
  const [showSaved, setShowSaved] = useState(false);

  const fetchNews = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/news?category=${cat}`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      const data = await resp.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(category);
  }, [category, fetchNews]);

  const toggleReadLater = (title: string) => {
    setReadLater((prev) => {
      const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
      localStorage.setItem(READ_LATER_KEY, JSON.stringify(next));
      toast.success(next.includes(title) ? "Salvat pentru mai târziu" : "Eliminat din salvate");
      return next;
    });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "acum";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const displayArticles = showSaved
    ? articles.filter((a) => readLater.includes(a.title))
    : articles;

  const categoryColors: Record<string, string> = {
    general: "bg-muted text-muted-foreground",
    technology: "bg-primary/10 text-primary",
    health: "bg-success/10 text-success",
    business: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <span className="gradient-text">News</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Agregator de știri din surse de încredere</p>
        </div>
        <Button
          variant={showSaved ? "default" : "ghost"}
          size="sm"
          className={showSaved ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}
          onClick={() => setShowSaved(!showSaved)}
        >
          <Bookmark className="h-4 w-4 mr-1" />
          Saved ({readLater.length})
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setShowSaved(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.id && !showSaved
                ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      ) : displayArticles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {showSaved ? "Nu ai articole salvate" : "Nu s-au găsit articole"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {displayArticles.map((article, idx) => {
              const isSaved = readLater.includes(article.title);
              return (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="widget-card group"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[category]}`}>
                        {categories.find((c) => c.id === category)?.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleReadLater(article.title)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-semibold leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {article.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {article.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/20">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-medium">{article.source.name}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(article.publishedAt)}
                        </span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Read <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const NewsPage = memo(NewsPageInner);
export default NewsPage;
