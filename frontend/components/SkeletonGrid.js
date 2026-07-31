export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse p-4">
          <div className="aspect-square w-full rounded-xl bg-line/60" />
          <div className="mt-3 h-3.5 w-3/4 rounded bg-line/60" />
          <div className="mt-2 h-3 w-1/2 rounded bg-line/40" />
          <div className="mt-4 h-8 w-full rounded-full bg-line/40" />
        </div>
      ))}
    </div>
  );
}
