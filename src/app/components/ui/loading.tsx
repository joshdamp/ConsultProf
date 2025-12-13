import { Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-muted rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
