import type { Task, TaskData } from "@/lib/parse-tasks";
import Section from "./Section";

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-b-0">
      <div
        className={`w-[18px] h-[18px] rounded-[5px] border-2 shrink-0 mt-0.5 ${
          task.done
            ? "bg-accent-green/20 border-accent-green"
            : "border-text-faint/60"
        }`}
      />
      <span
        className={`flex-1 text-sm leading-relaxed ${
          task.done ? "text-text-dim line-through" : "text-text-body"
        }`}
      >
        {task.text}
      </span>
      {task.tag && (
        <span className="text-[11px] text-text-dim bg-bg-elevated border border-border-card px-2 py-0.5 rounded shrink-0 mt-0.5">
          {task.tag}
        </span>
      )}
    </div>
  );
}

function PriorityGroup({
  label,
  color,
  tasks,
}: {
  label: string;
  color: string;
  tasks: Task[];
}) {
  return (
    <>
      <div
        className={`text-[11px] font-bold uppercase tracking-wider mt-3 first:mt-0 mb-1 pb-1 ${color}`}
      >
        {label}
      </div>
      {tasks.length > 0 ? (
        tasks.map((task, i) => <TaskItem key={i} task={task} />)
      ) : (
        <p className="text-[13px] text-text-faint italic py-2">Sin tareas</p>
      )}
    </>
  );
}

export default function TasksSection({ data }: { data: TaskData }) {
  return (
    <Section
      title="Tasks"
      badge={{
        text: `${data.totalPending} pendiente${data.totalPending !== 1 ? "s" : ""}`,
        color: data.totalPending > 0 ? "red" : "green",
      }}
      className="md:row-span-2"
    >
      <PriorityGroup
        label="Must"
        color="text-accent-red-text"
        tasks={data.must}
      />
      <PriorityGroup
        label="Should"
        color="text-accent-yellow-text"
        tasks={data.should}
      />
      <PriorityGroup
        label="Could"
        color="text-text-muted"
        tasks={data.could}
      />
    </Section>
  );
}
