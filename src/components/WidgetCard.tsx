import { ReactNode } from "react";
import { motion } from "framer-motion";

interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
}

export function WidgetCard({ title, icon, children, className = "", colSpan = 1 }: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`widget-card ${colSpan === 2 ? "md:col-span-2" : ""} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
