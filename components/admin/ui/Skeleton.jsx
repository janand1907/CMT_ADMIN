export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

export function SkeletonRows({ rows = 3, className = "h-4 w-full" }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
