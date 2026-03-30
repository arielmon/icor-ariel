import type { JournalData } from "@/lib/parse-journal";
import Section from "./Section";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-PA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function JournalSection({
  data,
}: {
  data: JournalData | null;
}) {
  if (!data) {
    return (
      <Section
        title="Journal"
        badge={{ text: "sin entradas", color: "gray" }}
        className="md:col-span-2"
      >
        <p className="text-[13px] text-text-faint italic py-2">
          No hay entradas en el journal
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Journal"
      badge={{ text: formatDate(data.date), color: "gray" }}
      className="md:col-span-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.brainDumps.map((entry, i) => (
          <div
            key={i}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-3.5"
          >
            {entry.timestamp && (
              <div className="text-xs text-text-dim font-medium mb-1.5">
                {entry.timestamp}
              </div>
            )}
            <div className="text-sm text-text-secondary leading-relaxed border-l-2 border-text-faint/40 pl-3.5">
              {entry.text}
            </div>
          </div>
        ))}

        {data.gratitude.length > 0 && (
          <div className="md:col-span-2 bg-bg-elevated border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-accent-green-text mb-1.5">
              Gratitud
            </div>
            {data.gratitude.map((item, i) => (
              <div key={i} className="text-[13px] text-text-muted py-0.5">
                &bull; {item}
              </div>
            ))}
          </div>
        )}

        {data.top3.length > 0 && (
          <div className="md:col-span-2 bg-bg-elevated border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-accent-yellow-text mb-1.5">
              Top 3 del día
            </div>
            {data.top3.map((item, i) => (
              <div key={i} className="text-[13px] text-text-muted py-0.5">
                {i + 1}. {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
