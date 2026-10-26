// ─── Placeholder Page ─────────────────────────────────────────────────────────
// Used for sections not yet implemented in Milestone 1.

interface Props {
  title: string;
  description: string;
  milestone: string;
  icon: string;
}

export function PlaceholderPage({ title, description, milestone, icon }: Props) {
  return (
    <div className="placeholder-page" role="main">
      <div className="placeholder-page-icon" aria-hidden="true">{icon}</div>
      <div className="placeholder-page-title">{title}</div>
      <div className="placeholder-page-desc">{description}</div>
      <div className="milestone-tag">{milestone}</div>
    </div>
  );
}
