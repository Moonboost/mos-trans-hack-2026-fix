"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  BookOpen,
  Siren,
  Heartbeat,
  Train,
  Users,
  Ticket,
  MapPin,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  easy:   "Легко",
  medium: "Средне",
  hard:   "Сложно",
};

const SERVICE_CLASS_LABEL: Record<string, string> = {
  standard: "Стандарт",
  comfort:  "Комфорт",
  business: "Бизнес",
  first:    "Первый",
  any:      "Любой класс",
};

const STAGE_LABEL: Record<string, string> = {
  boarding:  "Посадка",
  in_flight: "В пути",
  arrival:   "Прибытие",
};

const PASSENGER_LABEL: Record<string, string> = {
  regular:        "Обычный пассажир",
  with_child:     "Пассажир с ребёнком",
  with_animal:    "Пассажир с животным",
  intoxicated:    "Пассажир в состоянии опьянения",
  aggressive:     "Агрессивный пассажир",
  allergic:       "Пассажир с аллергией",
  late:           "Опоздавший пассажир",
  lost_item:      "Потеря вещи",
  no_document:    "Нет документа",
  unaccompanied_child: "Ребёнок без сопровождения",
  limited_mobility_hearing:    "Нарушение слуха",
  limited_mobility_vision:     "Нарушение зрения",
  limited_mobility_wheelchair: "Кресло-коляска",
  limited_mobility_motor:      "Ограничение mobility",
};

export default function ScenarioBriefPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    listScenarios()
      .then((items) => {
        setScenario(items.find((s) => s.slug === params.slug) ?? null);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  function handleStart() {
    setStarting(true);
    // The /play route starts the run itself via startRun(slug).
    router.push(`/app/scenarios/${params.slug}/play`);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-body-3 text-(--on-bg-medium)">
        Загрузка…
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-16 text-center">
        <h1 className="text-heading-2 font-extrabold tracking-tight">
          Сценарий не найден
        </h1>
        <p className="text-body-3 text-(--on-bg-medium)">
          Возможно, он был архивирован или удалён.
        </p>
        <Button variant="outlined" shape="round" asChild>
          <Link href="/app/scenarios">
            <ArrowLeft className="size-4" weight="bold" />
            К списку сценариев
          </Link>
        </Button>
      </div>
    );
  }

  const meta = CATEGORY_META[scenario.category] ?? CATEGORY_META.conflict;
  const Icon = meta.Icon;

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      {/* Back link */}
      <Link
        href="/app/scenarios"
        className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors"
      >
        <ArrowLeft className="size-3.5" weight="bold" />
        Все сценарии
      </Link>

      {/* Hero */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-(--brand-0) text-(--brand-9)">
            <Icon className="size-6" weight="bold" />
          </span>
          <Badge variant="tonal-static">{meta.label}</Badge>
        </div>

        <h1 className="text-display-2 md:text-display-1 font-extrabold tracking-tight leading-[1.05]">
          {scenario.title}
        </h1>

        {scenario.description && (
          <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-2xl">
            {scenario.description}
          </p>
        )}
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 rounded-2xl border border-(--outline) bg-(--card) p-6">
        <MetaItem
          icon={<Clock className="size-3.5" weight="bold" />}
          label="Таймер решения"
          value={scenario.timer_seconds ? `${scenario.timer_seconds} сек` : "Без таймера"}
        />
        <MetaItem
          icon={<ShieldCheck className="size-3.5" weight="bold" />}
          label="Сложность"
          value={DIFFICULTY_LABEL[scenario.difficulty] ?? scenario.difficulty}
        />
        <MetaItem
          icon={<Ticket className="size-3.5" weight="bold" />}
          label="Класс обслуживания"
          value={SERVICE_CLASS_LABEL[scenario.service_class] ?? scenario.service_class}
        />
        <MetaItem
          icon={<MapPin className="size-3.5" weight="bold" />}
          label="Стадия"
          value={STAGE_LABEL[scenario.stage] ?? scenario.stage}
        />
        <MetaItem
          icon={<Users className="size-3.5" weight="bold" />}
          label="Тип пассажира"
          value={PASSENGER_LABEL[scenario.passenger_type] ?? scenario.passenger_type}
        />
        <MetaItem
          icon={<ShieldCheck className="size-3.5" weight="bold" />}
          label="Награда"
          value={`+${scenario.xp_reward} XP`}
        />
      </div>

      {/* Regulatory reference */}
      {scenario.regulatory_ref && (
        <div className="flex items-start gap-4 rounded-2xl border border-(--outline) bg-(--card) p-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-(--brand-0) text-(--brand-9)">
            <BookOpen className="size-4" weight="bold" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-(--on-bg-low) mb-1">
              Нормативная база
            </p>
            <p className="text-body-3 text-(--on-bg-high) leading-snug">
              {scenario.regulatory_ref}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <Button
          size="large"
          shape="round"
          onClick={handleStart}
          disabled={starting}
          className="sm:w-auto"
        >
          {starting ? "Начинаем…" : "Начать сценарий"}
          <ArrowRight className="size-4" weight="bold" />
        </Button>
        <Button size="large" shape="round" variant="text" asChild>
          <Link href="/app/scenarios">Вернуться</Link>
        </Button>
      </div>

      <p className="text-body-5 text-(--on-bg-low) max-w-lg leading-relaxed">
        Таймер запустится с первым узлом. Решения влияют на обе шкалы —
        лояльность пассажира и рейтинг безопасности. Итоговый разбор
        покажет, как каждое действие повлияло на результат.
      </p>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-(--on-bg-low) mb-1.5">
        {icon}
        <span className="text-[11px] font-extrabold uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>
      <p className="text-body-3 font-medium text-(--on-bg-high) truncate">
        {value}
      </p>
    </div>
  );
}
