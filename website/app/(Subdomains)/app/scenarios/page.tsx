"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  Siren,
  Heartbeat,
  Train,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { listScenarios } from "@/entities/scenario/api/client";
import type { Scenario } from "@/entities/scenario/model/types";

const CATEGORY_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string; weight?: "bold" | "fill" | "regular" }> }
> = {
  conflict: { label: "Конфликт", Icon: Siren },
  medical:  { label: "Медицина", Icon: Heartbeat },
  service:  { label: "Сервис",   Icon: Train },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy:   "легко",
  medium: "средне",
  hard:   "сложно",
};

function formatTimer(seconds?: number | null): string {
  if (!seconds) return "—";
  return `${seconds} сек`;
}

export default function ScenariosPage() {
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listScenarios()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-display-3 font-extrabold tracking-tight">
          Сценарии
        </h1>
        <p className="text-body-3 text-(--on-bg-medium) max-w-2xl leading-relaxed">
          Каждый сценарий — нелинейный диалог с таймером и двумя шкалами:
          лояльность пассажира и рейтинг безопасности.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-(--outline) bg-(--card) p-6 animate-pulse"
            >
              <div className="flex justify-between mb-6">
                <div className="size-12 rounded-xl bg-(--state-hover)" />
                <div className="h-6 w-20 rounded-full bg-(--state-hover)" />
              </div>
              <div className="h-5 w-3/4 rounded bg-(--state-hover) mb-3" />
              <div className="h-4 w-1/2 rounded bg-(--state-hover)" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-(--outline) bg-(--card) p-12 text-center">
          <p className="text-body-3 text-(--on-bg-medium)">
            Пока нет активных сценариев
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => {
            const meta = CATEGORY_META[s.category] ?? CATEGORY_META.conflict;
            const Icon = meta.Icon;
            return (
              <Link
                key={s.slug}
                href={`/app/scenarios/${s.slug}`}
                className="group block"
              >
                <div className="h-full rounded-2xl border border-(--outline) bg-(--card) p-6 transition-all duration-200 group-hover:border-(--brand-9) group-hover:-translate-y-0.5">
                  {/* Top row: icon tile + category badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <span className="grid size-12 place-items-center rounded-xl bg-(--brand-0) text-(--brand-9)">
                      <Icon className="size-6" weight="bold" />
                    </span>
                    <Badge variant="tonal-static">{meta.label}</Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-heading-4 font-extrabold tracking-tight leading-snug mb-4">
                    {s.title}
                  </h3>

                  {/* Meta row */}
                  <div className="flex items-center gap-5 text-body-5 text-(--on-bg-low)">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" weight="bold" />
                      {formatTimer(s.timer_seconds)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5" weight="bold" />
                      {DIFFICULTY_LABEL[s.difficulty] ?? s.difficulty}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
