import type { InboxData } from "@/lib/parse-inbox";
import Section from "./Section";

export default function InboxSection({ data }: { data: InboxData }) {
  const hasItems = data.unprocessed.length > 0;

  return (
    <Section
      title="Inbox"
      badge={{
        text: `${data.unprocessed.length} sin procesar`,
        color: hasItems ? "red" : "green",
      }}
    >
      {hasItems ? (
        data.unprocessed.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-b-0"
          >
            <span className="w-[7px] h-[7px] bg-accent-red rounded-full shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
            <span className="flex-1 text-sm text-text-body">{item.text}</span>
            <span className="text-[11px] text-text-faint">{item.date}</span>
          </div>
        ))
      ) : (
        <p className="text-[13px] text-text-faint italic py-2">
          Inbox limpio — todo procesado
        </p>
      )}
    </Section>
  );
}
