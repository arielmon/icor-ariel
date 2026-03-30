import Header from "@/components/Header";
import TasksSection from "@/components/TasksSection";
import InboxSection from "@/components/InboxSection";
import OkrSection from "@/components/OkrSection";
import JournalSection from "@/components/JournalSection";
import { getTaskData } from "@/lib/parse-tasks";
import { getInboxData } from "@/lib/parse-inbox";
import { getOkrData } from "@/lib/parse-okrs";
import { getJournalData } from "@/lib/parse-journal";

function formatDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formatted = now.toLocaleDateString("es-PA", options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function Home() {
  const tasks = getTaskData();
  const inbox = getInboxData();
  const okrs = getOkrData();
  const journal = getJournalData();

  const stats = [
    {
      color: tasks.totalPending > 0 ? ("red" as const) : ("green" as const),
      label: `${tasks.totalPending} tarea${tasks.totalPending !== 1 ? "s" : ""} must`,
    },
    {
      color:
        inbox.unprocessed.length > 0
          ? ("red" as const)
          : ("green" as const),
      label:
        inbox.unprocessed.length > 0
          ? `${inbox.unprocessed.length} inbox`
          : "Inbox limpio",
    },
    {
      color:
        okrs.overallProgress === 0
          ? ("yellow" as const)
          : okrs.overallProgress >= 60
            ? ("green" as const)
            : ("red" as const),
      label:
        okrs.overallProgress === 0
          ? "OKRs: sin definir"
          : `OKRs: ${okrs.overallProgress}%`,
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-6 lg:px-12 lg:py-10">
      <Header date={formatDate()} stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TasksSection data={tasks} />
        <InboxSection data={inbox} />
        <OkrSection data={okrs} />
        <JournalSection data={journal} />
      </div>

      <footer className="text-center py-8 text-[11px] text-text-faint/60 tracking-wide">
        Powered by ICOR Life OS
      </footer>
    </div>
  );
}
