import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] grid place-items-center bg-(--bg) px-6">
      <div className="max-w-xl text-center">
        <p className="font-mono text-body-5 text-(--on-bg-low) mb-4 tracking-widest">
          ERROR 404
        </p>
        <h1 className="text-display-1 font-extrabold tracking-tight mb-6">
          Маршрут не найден
        </h1>
        <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-10">
          Страница не существует или была перемещена.
          Проверьте адрес или вернитесь на главную.
        </p>
        <Link
          href="/"
          className="inline-flex items-center h-12 px-7 rounded-full bg-(--brand-9) text-white text-base font-extrabold tracking-tight transition-transform hover:-translate-y-0.5"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
