import { memo, useState, useCallback } from "react";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetSkeleton } from "@/components/WidgetSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useWidgetData } from "@/hooks/useWidgetData";
import { fetchTasksMock, saveTasksToStorage, TaskItem } from "@/lib/mockData";

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
};

function TaskListInner() {
  const fetcher = useCallback(() => fetchTasksMock(), []);
  const { data, isLoading, refresh } = useWidgetData<TaskItem[]>("tasks", fetcher);
  const [tasks, setTasksLocal] = useState<TaskItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [synced, setSynced] = useState(false);

  // Sync initial data
  if (data && !synced) {
    setTasksLocal(data);
    setSynced(true);
  }

  const updateTasks = (updated: TaskItem[]) => {
    setTasksLocal(updated);
    saveTasksToStorage(updated);
  };

  const toggleTask = (id: string) => {
    updateTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: TaskItem = {
      id: `t${Date.now()}`,
      title: newTask.trim(),
      done: false,
      priority: "medium",
      createdAt: new Date().toISOString(),
    };
    updateTasks([task, ...tasks]);
    setNewTask("");
  };

  const deleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  if (isLoading && !data) return <WidgetSkeleton />;

  const done = tasks.filter((t) => t.done).length;

  return (
    <WidgetCard
      title={`Tasks (${done}/${tasks.length})`}
      icon={<ListTodo className="h-4 w-4" />}
      accentColor="hsl(262, 83%, 58%)"
      onRefresh={refresh}
      delay={5}
    >
      <div className="space-y-3">
        {/* Add task */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="bg-secondary/50 border-border/50 text-sm h-8"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-primary hover:bg-primary/10"
            onClick={addTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Task list */}
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors group ${
                task.done ? "opacity-50" : "hover:bg-card-hover"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
              <Checkbox
                checked={task.done}
                onCheckedChange={() => toggleTask(task.id)}
                className="shrink-0"
              />
              <span className={`flex-1 truncate ${task.done ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

export const TaskList = memo(TaskListInner);
