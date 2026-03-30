interface Badge {
  text: string;
  color: "red" | "yellow" | "green" | "gray";
}

interface SectionProps {
  title: string;
  badge?: Badge;
  className?: string;
  children: React.ReactNode;
}

const badgeStyles = {
  red: "bg-accent-red/15 text-accent-red-text border border-accent-red/25",
  yellow:
    "bg-accent-yellow/12 text-accent-yellow-text border border-accent-yellow/20",
  green:
    "bg-accent-green/12 text-accent-green-text border border-accent-green/20",
  gray: "bg-text-faint/12 text-text-muted border border-text-faint/20",
};

export default function Section({
  title,
  badge,
  className = "",
  children,
}: SectionProps) {
  return (
    <div
      className={`bg-bg-card border border-border-card rounded-xl overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center px-5 py-3.5 bg-bg-card-header border-b border-border-card">
        <h2 className="text-[13px] font-display font-semibold text-text-primary uppercase tracking-wider">
          {title}
        </h2>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeStyles[badge.color]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className="px-5 py-3.5">{children}</div>
    </div>
  );
}
