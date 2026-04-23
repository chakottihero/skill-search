function SkeletonCard() {
  return (
    <div className="py-6 animate-pulse">
      <div className="h-5 w-52 rounded bg-white/10" />
      <div className="mt-1.5 h-3 w-72 rounded bg-white/5" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-4 w-8 rounded bg-white/5" />
        <div className="h-4 w-16 rounded bg-white/5" />
        <div className="h-4 w-20 rounded bg-blue-500/10" />
        <div className="h-4 w-16 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Search bar skeleton */}
      <div className="mb-8 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-full bg-white/5" />
        <div className="h-10 w-16 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Controls skeleton */}
      <div className="mb-6 flex justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        <div className="flex gap-3">
          <div className="h-4 w-12 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-14 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-12 animate-pulse rounded bg-white/5" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="divide-y divide-white/[0.08]">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
