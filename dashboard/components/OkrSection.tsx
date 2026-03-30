import type { OkrData, Objective } from "@/lib/parse-okrs";
import Section from "./Section";

function progressColor(progress: number): string {
  if (progress === 0) return "bg-text-faint";
  if (progress < 30) return "bg-accent-red";
  if (progress <= 60) return "bg-accent-yellow";
  return "bg-accent-green";
}

function OkrCard({ objective }: { objective: Objective }) {
  const isTbd = objective.title === "[TBD]" || !objective.title;

  return (
    <div className="mb-4 pb-4 border-b border-border-subtle last:mb-0 last:pb-0 last:border-b-0">
      <div className="text-sm text-text-body font-medium mb-2">
        {isTbd ? (
          <span className="text-text-faint">[Sin definir]</span>
        ) : (
          objective.title
        )}
      </div>
      <div className="bg-border-card rounded-[5px] h-2 mb-1.5">
        <div
          className={`h-full rounded-[5px] transition-all duration-300 ${progressColor(objective.progress)}`}
          style={{ width: `${Math.max(objective.progress, 0)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-dim font-medium">
        <span>{objective.status}</span>
        <span>{objective.progress}%</span>
      </div>
    </div>
  );
}

export default function OkrSection({ data }: { data: OkrData }) {
  const allTbd = data.objectives.every(
    (o) => o.title === "[TBD]" || !o.title
  );

  return (
    <Section
      title={`OKRs${data.quarter ? ` — ${data.quarter}` : ""}`}
      badge={{
        text: allTbd
          ? "Sin definir"
          : `${data.overallProgress}%`,
        color: allTbd
          ? "yellow"
          : data.overallProgress >= 60
            ? "green"
            : data.overallProgress >= 30
              ? "yellow"
              : "red",
      }}
    >
      {data.objectives.map((obj, i) => (
        <OkrCard key={i} objective={obj} />
      ))}
    </Section>
  );
}
