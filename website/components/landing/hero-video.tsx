import Link from "next/link";

/**
 * Full-bleed hero with the brand video behind a Moscow-blue scrim.
 * Source: /public/videos/hero-video.webm
 */
export function HeroVideo() {
  return (
    <section className="relative w-full min-h-[88vh] bg-(--brand-9) overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/hero-video.webm" type="video/webm" />
      </video>

      {/* Scrim: bottom-heavy brand-blue gradient so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-(--brand-9) via-(--brand-9)/60 to-(--brand-9)/15" />

      <div className="relative h-full min-h-[88vh] max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-24">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-8">
          <span className="size-1.5 rounded-full bg-white" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
            Хакатон Московского транспорта · 2026
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.98] text-white mb-6 max-w-5xl tracking-tight">
          Геймификация<br />для высокоскоростной магистрали
        </h1>

        <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed mb-10">
          Тренажёр проводника ВСМ-400. Нелинейные сценарии нештатных ситуаций,
          двойная шкала оценки, таймер решений и система достижений.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/scenarios"
            className="inline-flex items-center h-12 px-7 rounded-full bg-white text-(--brand-9) text-base font-extrabold tracking-tight transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Начать тренировку
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center h-12 px-7 rounded-full border border-white/30 text-white text-base font-extrabold tracking-tight backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Войти
          </Link>
        </div>
      </div>
    </section>
  );
}
