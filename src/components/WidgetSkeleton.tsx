export function WidgetSkeleton() {
  return (
    <div className="widget-card animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
