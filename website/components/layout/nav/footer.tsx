import Link from "next/link"
import { Train } from "@phosphor-icons/react/dist/ssr"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { MadeOnAmorfa } from "@/components/badges/made-on-amorfa"

export default function Footer() {
  return (
    <footer className="border-t border-(--outline) bg-(--card)">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-10">
        {/* Top row: brand + controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="grid size-9 place-items-center rounded-xl bg-(--brand-9) text-white transition-transform group-hover:scale-105">
              <Train className="size-4.5" weight="fill" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-heading-5 font-extrabold tracking-tight">
                Геймификация для ВСМ
              </span>
              <span className="text-body-5 text-(--on-bg-low)">
                Хакатон Московского транспорта · 2026
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeSwitcher />
            <MadeOnAmorfa />
          </div>
        </div>

        {/* Bottom row: legal + stack */}
        <div className="mt-8 pt-6 border-t border-(--outline) flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-(--on-bg-low)">
            СТО РЖД 03.011 / 03.013 / 03.014
          </p>
          <p className="text-[11px] font-mono text-(--on-bg-low)">
            FastAPI · Next.js · PostgreSQL · Valkey
          </p>
        </div>
      </div>
    </footer>
  )
}
