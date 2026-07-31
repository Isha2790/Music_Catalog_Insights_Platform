export default function EqBars({ className = '' }) {
  return (
    <span className={`eq-bars ${className}`} aria-hidden="true">
      <span className="h-full animate-eq-1" />
      <span className="h-full animate-eq-2" />
      <span className="h-full animate-eq-3" />
      <span className="h-full animate-eq-4" />
    </span>
  );
}
