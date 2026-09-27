/**
 * Hero video block — full-bleed brand video with a Moscow-blue scrim.
 * Video source: /public/videos/hero-video.webm
 *
 * Drop a .webm into website/public/videos/ and it renders automatically.
 * Fallback poster is intentionally omitted — the brand-blue background
 * acts as the loading state.
 */
export function HeroVideo() {
  return (
    <section className="relative w-full aspect-video min-h-[420px] max-h-[80vh] bg-(--brand-9) overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/hero-video-mt.mp4" type="video/mp4" />
      </video>

      {/* Brand-blue scrim — same hue as --brand-9, keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-(--brand-9) via-(--brand-9)/40 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 md:pb-20">
        <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/80 mb-3 font-semibold">
          Московский транспорт · Хакатон 2026
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-white mb-4 max-w-4xl">
          Геймификация для ВСМ
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
          Интерактивный тренажёр проводника высокоскоростной магистрали.
          Нелинейные сценарии, двойная шкала оценки, живой таймер решений.
        </p>
      </div>
    </section>
  );
}
