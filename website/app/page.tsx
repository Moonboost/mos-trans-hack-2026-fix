"use client";

import Link from "next/link";
import {
  Train, Timer, Scales, TrophyIcon, Users, ShieldCheck,
  WarningCircle, Heartbeat, ChatCircleDots, ArrowRight,
  BookOpen, Wheelchair, Siren, UserCircle, Armchair,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroVideo } from "@/components/landing/hero-video";

// ----------------------------------------------------------------
// Data
// ----------------------------------------------------------------

const TRUST_ITEMS = [
  "СТО РЖД 03.011–2026",
  "СТО РЖД 03.013–2026",
  "СТО РЖД 03.014–2026",
  "ВСМ-400 · Москва — Санкт-Петербург",
];

const PROBLEMS = [
  {
    icon: Timer,
    title: "Нет стрессоустойчивости",
    text: "Лекции и тесты не воспроизводят давление секунд, когда решение нужно принимать мгновенно.",
  },
  {
    icon: WarningCircle,
    title: "Нет безопасной среды",
    text: "Отрабатывать нештатные ситуации на реальных пассажирах — дорого и рискованно.",
  },
  {
    icon: UserCircle,
    title: "Soft skills не измерить",
    text: "Классическая аттестация не оценивает эмпатию, деэскалацию и работу по ролевой модели.",
  },
  {
    icon: TrophyIcon,
    title: "Низкая мотивация",
    text: "У сотрудника нет прогресса, уровней и понятной обратной связи о собственном росте.",
  },
];

const FEATURES = [
  {
    icon: ChatCircleDots,
    title: "Нелинейный движок",
    text: "Ветвление диалога, условия, несколько развилок. Не тест с одним верным ответом.",
  },
  {
    icon: Timer,
    title: "Таймер решений",
    text: "Ограничение времени в критических сценариях. Просрочка влияет на исход и итоговые шкалы.",
  },
  {
    icon: Scales,
    title: "Двойная шкала",
    text: "«Лояльность пассажира» и «Рейтинг безопасности» отслеживаются параллельно на каждом шаге.",
  },
  {
    icon: TrophyIcon,
    title: "Достижения",
    text: "Бейджи, уровни и очки компетенций за прохождение сценариев и освоение навыков.",
  },
  {
    icon: Users,
    title: "Таблица лидеров",
    text: "Рейтинг проводников внутри бригад, депо и компании по накопленному опыту.",
  },
  {
    icon: Heartbeat,
    title: "Разбор и аналитика",
    text: "Детальный пост-мортем по каждому шагу: что повлияло на шкалы и как поступить лучше.",
  },
];

const ROLE_STEPS = [
  { n: "01", title: "Признать", text: "«Я Вас понимаю…»" },
  { n: "02", title: "Обозначить правило", text: "«Обращаю Ваше внимание…»" },
  { n: "03", title: "Предложить решение", text: "«Я уточню и вернусь к Вам…»" },
  { n: "04", title: "Заверить", text: "«Благодарю за понимание…»" },
];

const SCENARIOS = [
  {
    slug: "22-loud-music",
    tag: "Конфликт",
    title: "Громкая музыка в вагоне",
    time: "30 сек",
    dif: "легко",
    icon: Siren,
  },
  {
    slug: "06-intoxicated-passenger",
    tag: "Конфликт",
    title: "Пассажир с признаками опьянения",
    time: "15 сек",
    dif: "сложно",
    icon: WarningCircle,
  },
  {
    slug: "11-allergy-animals",
    tag: "Медицина",
    title: "Аллергия на животных в салоне",
    time: "25 сек",
    dif: "средне",
    icon: Heartbeat,
  },
  {
    slug: "28-medication-request",
    tag: "Медицина",
    title: "Просьба дать лекарство",
    time: "20 сек",
    dif: "сложно",
    icon: Heartbeat,
  },
  {
    slug: "08-upgrade-class",
    tag: "Сервис",
    title: "Повышение класса обслуживания",
    time: "30 сек",
    dif: "средне",
    icon: Train,
  },
];

const STANDARDS = [
  {
    icon: Train,
    code: "СТО РЖД 03.011–2026",
    title: "Обслуживание пассажиров на ВСМ",
    text: "Классы обслуживания, SLA реакции персонала, набор сопутствующих услуг.",
  },
  {
    icon: BookOpen,
    code: "СТО РЖД 03.013–2026",
    title: "Оснащённость вагонов",
    text: "Оборудование, инвентарь и расходные материалы для каждого класса.",
  },
  {
    icon: Wheelchair,
    code: "СТО РЖД 03.014–2026",
    title: "Маломобильные пассажиры",
    text: "Функциональные требования к подвижному составу и вокзальным комплексам.",
  },
  {
    icon: Armchair,
    code: "СТО РЖД 03.012–2026",
    title: "Бизнес-залы на вокзалах",
    text: "Требования к обслуживанию в зонах повышенной комфортности.",
  },
];

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function HomePage() {
  return (
    <main className="bg-(--bg) text-(--on-bg-high) antialiased">
      <HeroVideo />

      {/* -------------------------------------------------- Trust strip */}
      <section className="border-y border-(--outline) bg-(--card)">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-6 flex flex-wrap items-center gap-x-10 gap-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--on-bg-low)">
            Опора на нормативы
          </span>
          {TRUST_ITEMS.map((t) => (
            <span key={t} className="text-sm font-normal text-(--on-bg-medium)">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- Problem */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-24">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
            Проблема
          </p>
          <h2 className="text-display-2 md:text-display-1 font-extrabold tracking-tight mb-5">
            Классическое обучение не готовит к реальному стрессу
          </h2>
          <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
            Проводник ВСМ-400 принимает решения за секунды: от конфликта в вагоне
            до медицинского инцидента. Лекции и тесты этого не тренируют.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.title}
                className="p-6 bg-(--card) border border-(--outline) rounded-2xl ring-0"
              >
                <div className="size-11 grid place-items-center rounded-xl bg-(--brand-0) text-(--brand-9) mb-5">
                  <Icon className="size-5" weight="bold" />
                </div>
                <h3 className="text-heading-4 font-extrabold mb-2 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                  {p.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- Features (bento) */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 pb-24">
        <div className="max-w-3xl mb-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
            Решение
          </p>
          <h2 className="text-display-2 md:text-display-1 font-extrabold tracking-tight mb-5">
            Виртуальная среда, где ошибка ничего не стоит
          </h2>
          <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
            Модульное приложение: движок сценариев, две шкалы, таймеры,
            достижения и аналитика компетенций.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isHero = i === 0;
            return (
              <Card
                key={f.title}
                className={
                  "p-7 rounded-2xl ring-0 border " +
                  (isHero
                    ? "lg:col-span-2 bg-(--brand-9) text-white border-transparent"
                    : "bg-(--card) border-(--outline)")
                }
              >
                <div
                  className={
                    "size-11 grid place-items-center rounded-xl mb-5 " +
                    (isHero
                      ? "bg-white/15 text-white"
                      : "bg-(--brand-0) text-(--brand-9)")
                  }
                >
                  <Icon className="size-5" weight="bold" />
                </div>
                <h3
                  className={
                    "text-heading-3 font-extrabold mb-2 tracking-tight " +
                    (isHero ? "text-white" : "")
                  }
                >
                  {f.title}
                </h3>
                <p
                  className={
                    "text-body-3 leading-relaxed " +
                    (isHero ? "text-white/80" : "text-(--on-bg-medium)")
                  }
                >
                  {f.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- Dual scale + Role model */}
      <section className="bg-(--card) border-y border-(--outline)">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-24 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
              Механика
            </p>
            <h2 className="text-display-3 md:text-display-2 font-extrabold tracking-tight mb-6">
              Две живые шкалы на каждом шаге
            </h2>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-8">
              Каждое решение двигает сразу обе шкалы. Уступил пассажиру — выросла
              лояльность. Нарушил протокол — упал рейтинг безопасности. Итоговый
              вердикт показывает, где именно решение дало трещину.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-body-4 font-normal text-(--on-bg-medium)">
                    Лояльность пассажира
                  </span>
                  <span className="font-mono text-body-3 text-(--on-bg-high)">78</span>
                </div>
                <div className="h-2 rounded-full bg-(--gray-3) overflow-hidden">
                  <div className="h-full bg-(--green-6)" style={{ width: "78%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-body-4 font-normal text-(--on-bg-medium)">
                    Рейтинг безопасности
                  </span>
                  <span className="font-mono text-body-3 text-(--on-bg-high)">42</span>
                </div>
                <div className="h-2 rounded-full bg-(--gray-3) overflow-hidden">
                  <div className="h-full bg-(--orange-5)" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
              Ролевая модель
            </p>
            <h2 className="text-display-3 md:text-display-2 font-extrabold tracking-tight mb-6">
              Четыре шага сервисного общения
            </h2>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-8">
              Из «Ситуаций на борту» — обязательный цикл коммуникации.
              Пропуск шага «Признать» или «Предложить решение» бьёт по лояльности.
            </p>

            <ol className="space-y-3">
              {ROLE_STEPS.map((s, i) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--brand-9) text-white font-extrabold text-sm">
                    {s.n}
                  </span>
                  <div className="pt-1">
                    <p className="text-heading-5 font-extrabold tracking-tight">
                      {s.title}
                    </p>
                    <p className="text-body-4 text-(--on-bg-medium) italic">{s.text}</p>
                  </div>
                  {i < ROLE_STEPS.length - 1 && (
                    <ArrowRight className="hidden" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Scenarios */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
              Сценарии
            </p>
            <h2 className="text-display-2 md:text-display-1 font-extrabold tracking-tight mb-4">
              Типовые ситуации на борту
            </h2>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
              Конфликты, медицина, сервис. Каждый сценарий — нелинейный диалог
              с таймером и собственным набором компетенций.
            </p>
          </div>
          <Link
            href="/app/scenarios"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-(--brand-9) text-(--brand-9) text-base font-extrabold tracking-tight transition-colors hover:bg-(--brand-0)"
          >
            Все сценарии <ArrowRight className="size-4" weight="bold" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.slug} href={`/app/scenarios/${s.slug}`}>
                <Card className="p-6 h-full bg-(--card) border border-(--outline) rounded-2xl ring-0 transition-all hover:border-(--brand-9) hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-(--brand-0) text-(--brand-9)">
                      <Icon className="size-5" weight="bold" />
                    </span>
                    <Badge variant="tonal-static">{s.tag}</Badge>
                  </div>
                  <h3 className="text-heading-4 font-extrabold mb-3 leading-snug tracking-tight">
                    {s.title}
                  </h3>
                  <div className="flex items-center gap-4 text-body-5 text-(--on-bg-low)">
                    <span className="inline-flex items-center gap-1.5">
                      <Timer className="size-3.5" weight="bold" /> {s.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5" weight="bold" /> {s.dif}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- Standards */}
      <section className="bg-(--card) border-y border-(--outline)">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-24">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--brand-9) mb-4">
              Нормативная база
            </p>
            <h2 className="text-display-2 md:text-display-1 font-extrabold tracking-tight mb-4">
              Всё заземлено в стандартах РЖД
            </h2>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
              Сценарии, критерии оценки и ролевая модель опираются на
              действующие СТО. Никаких выдуманных «правильных ответов».
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STANDARDS.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.code}
                  className="p-7 bg-(--bg) border border-(--outline) rounded-2xl ring-0"
                >
                  <div className="size-11 grid place-items-center rounded-xl bg-(--brand-9) text-white mb-5">
                    <Icon className="size-5" weight="bold" />
                  </div>
                  <p className="text-body-5 font-mono text-(--on-bg-low) mb-2 tracking-tight">
                    {s.code}
                  </p>
                  <h3 className="text-heading-4 font-extrabold mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                    {s.text}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- CTA */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-24">
        <div className="rounded-3xl bg-(--brand-9) text-white px-8 md:px-16 py-16 md:py-20">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/70 mb-4">
            Готовы начать
          </p>
          <h2 className="text-display-2 md:text-display-1 font-extrabold tracking-tight mb-6 max-w-3xl">
            Пройдите первый сценарий за две минуты
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center h-12 px-7 rounded-full bg-white text-(--brand-9) text-base font-extrabold tracking-tight transition-transform hover:-translate-y-0.5"
            >
              Войти и играть
            </Link>
            <Link
              href="/app/scenarios"
              className="inline-flex items-center h-12 px-7 rounded-full border border-white/30 text-white text-base font-extrabold tracking-tight transition-colors hover:bg-white/10"
            >
              Список сценариев
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
