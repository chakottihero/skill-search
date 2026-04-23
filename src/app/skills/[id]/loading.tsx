export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      <div className="mb-6 h-4 w-24 rounded bg-white/5" />
      <div className="h-8 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-3 w-80 rounded bg-white/5" />
      <div className="mt-4 flex gap-3">
        <div className="h-4 w-10 rounded bg-white/5" />
        <div className="h-4 w-16 rounded bg-white/5" />
        <div className="h-4 w-20 rounded bg-blue-500/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
      </div>
      <hr className="my-8 border-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-white/5"
            style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
