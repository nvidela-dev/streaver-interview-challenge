'use client';

export function SkeletonCard() {
  return (
    <div className="rounded-md bg-white/5 p-6 animate-skeleton">
      {/* Title skeleton */}
      <div className="h-5 w-3/4 bg-white/10 rounded mb-4" />

      {/* Body skeleton - multiple lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-4/6 bg-white/10 rounded" />
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-3 w-16 bg-white/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-white/10 rounded-full" />
          <div className="h-8 w-16 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
