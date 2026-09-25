"use client";
import { cn } from "@/lib/utils";

interface DualScaleProps {
  loyalty: number;
  safety: number;
  className?: string;
}

function Bar({ value, tone }: { value: number; tone: "loyalty" | "safety" }) {
  const color =
    value >= 70 ? (tone === "loyalty" ? "bg-(--green-6)" : "bg-(--teal-6)")
    : value >= 40 ? "bg-(--orange-5)"
    : "bg-(--red-7)";
  return (
    <div className="h-2 w-full rounded-full bg-(--gray-3) overflow-hidden">
      <div
        className={cn("h-full transition-all duration-500 ease-out", color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function DualScale({ loyalty, safety, className }: DualScaleProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-body-5">
          <span className="text-(--on-bg-medium)">Лояльность пассажира</span>
          <span className="font-mono text-(--on-bg-high)">{loyalty}</span>
        </div>
        <Bar value={loyalty} tone="loyalty" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-body-5">
          <span className="text-(--on-bg-medium)">Рейтинг безопасности</span>
          <span className="font-mono text-(--on-bg-high)">{safety}</span>
        </div>
        <Bar value={safety} tone="safety" />
      </div>
    </div>
  );
}
