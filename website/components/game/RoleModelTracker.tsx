"use client";
import { cn } from "@/lib/utils";
import type { RoleStep } from "@/entities/scenario/model/types";

const STEPS: { key: RoleStep; label: string; hint: string }[] = [
  { key: "admit",          label: "Признать",           hint: "«Я Вас понимаю...»" },
  { key: "state_rule",     label: "Обозначить правило", hint: "«Обращаю Ваше внимание...»" },
  { key: "offer_solution", label: "Предложить решение", hint: "«Я уточню и вернусь...»" },
  { key: "reassure",       label: "Заверить",           hint: "«Благодарю за понимание...»" },
];

export function RoleModelTracker({ seen }: { seen: RoleStep[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const done = seen.includes(s.key);
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-body-5 transition-colors",
                done
                  ? "bg-(--green-1) text-(--green-9)"
                  : "bg-(--gray-1) text-(--gray-6)"
              )}
              title={s.hint}
            >
              <span className={cn(
                "grid size-3.5 place-items-center rounded-full text-[10px] font-mono",
                done ? "bg-(--green-7) text-white" : "bg-(--gray-4) text-white"
              )}>
                {done ? "✓" : i + 1}
              </span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cn("text-body-5", done ? "text-(--green-7)" : "text-(--gray-4)")}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
