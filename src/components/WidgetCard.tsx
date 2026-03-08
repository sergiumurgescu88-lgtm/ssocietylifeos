import { ReactNode, memo } from "react";
import { motion } from "framer-motion";
import { RefreshCw, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  accentColor?: string;
  lastUpdated?: Date | null;
  source?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClick?: () => void;
  delay?: number;
}

function WidgetCardInner({
  title,
  icon,
  children,
  className = "",
  colSpan = 1,
  accentColor,
  lastUpdated,
  source,
  isLoading,
  error,
  onRefresh,
  onClick,
  delay = 0,
}: WidgetCardProps) {
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay * 0.08 }}
      className={`widget-card flex flex-col ${colSpan === 2 ? "md:col-span-2" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-primary shrink-0">{icon}</span>}
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>Refresh</DropdownMenuItem>
              )}
              <DropdownMenuItem>Hide widget</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {error && !children ? (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            Data unavailable
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {(lastUpdated || source) && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
          {source && (
            <span className="text-[10px] text-muted-foreground/60">{source}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export const WidgetCard = memo(WidgetCardInner);
