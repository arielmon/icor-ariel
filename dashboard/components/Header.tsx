interface StatDot {
  color: "red" | "yellow" | "green" | "gray";
  label: string;
}

interface HeaderProps {
  date: string;
  stats: StatDot[];
}

const dotColors = {
  red: "bg-accent-red shadow-[0_0_6px_var(--accent-red)]",
  yellow: "bg-accent-yellow shadow-[0_0_6px_var(--accent-yellow)]",
  green: "bg-accent-green shadow-[0_0_6px_var(--accent-green)]",
  gray: "bg-text-faint shadow-[0_0_6px_var(--text-faint)]",
};

export default function Header({ date, stats }: HeaderProps) {
  return (
    <header className="mb-9">
      <div className="flex justify-between items-baseline mb-1">
        <h1 className="text-[28px] font-display font-bold text-text-primary tracking-tight lg:text-[32px]">
          ICOR
        </h1>
        <span className="text-sm text-text-dim font-body">{date}</span>
      </div>
      <div className="flex mt-3.5 bg-bg-card-header border border-border-card rounded-xl overflow-hidden max-md:flex-col">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex items-center gap-2 text-[13px] font-medium text-text-muted px-5 py-3.5 flex-1 justify-center max-md:justify-start max-md:border-b max-md:border-border-card max-md:last:border-b-0 ${
              i < stats.length - 1 ? "md:border-r md:border-border-card" : ""
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${dotColors[stat.color]}`}
            />
            {stat.label}
          </div>
        ))}
      </div>
    </header>
  );
}
