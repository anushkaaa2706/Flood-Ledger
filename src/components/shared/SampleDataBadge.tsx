// ─── Shared: Sample Data Badge ───────────────────────────────────────────────

interface Props {
  className?: string;
}

export function SampleDataBadge({ className }: Props) {
  return (
    <span className={`sample-badge ${className ?? ''}`}>
      ⚠ Sample Data
    </span>
  );
}
