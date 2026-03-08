import { ReactNode, useState } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  blurPreview?: boolean;
}

export function FeatureGate({ feature, children, fallback, blurPreview = true }: FeatureGateProps) {
  const { hasAccess } = useFeatureAccess(feature);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <>
      <div className="relative cursor-pointer" onClick={() => setShowUpgrade(true)}>
        {blurPreview && (
          <div className="filter blur-sm pointer-events-none select-none">
            {children}
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <Lock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-foreground">Upgrade to unlock</p>
          <p className="text-xs text-muted-foreground mt-1">This feature requires a paid plan</p>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
