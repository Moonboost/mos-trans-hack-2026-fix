"use client"

import { useState } from "react"
import Link from "next/link"
import { Train, List, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const NAV = [
  { href: "/app/scenarios",  label: "Сценарии" },
  { href: "/app/leaderboard", label: "Лидерборд" },
  { href: "/app/profile",    label: "Профиль" },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-(--outline) bg-(--bg)/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-9 place-items-center rounded-xl bg-(--brand-9) text-white">
            <Train className="size-5" weight="fill" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-(--on-bg-low)">
              Московский транспорт
            </span>
            <span className="text-heading-5 font-extrabold tracking-tight">
              Геймификация ВСМ
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Button key={item.href} variant="text" size="small" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <div className="mx-2 h-5 w-px bg-(--outline)" aria-hidden />
          <Button variant="text" size="small" asChild>
            <Link href="/login">Войти</Link>
          </Button>
          <Button size="small" shape="round" asChild>
            <Link href="/app/scenarios">Играть</Link>
          </Button>
        </nav>

        {/* Mobile burger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="text"
              size="icon-small"
              className="md:hidden"
              aria-label="Открыть меню"
            >
              <List className="size-5" weight="bold" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] bg-(--bg) border-l border-(--outline) p-0"
            showCloseButton={false}
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-(--outline)">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-(--on-bg-low)">
                Меню
              </span>
              <Button
                variant="text"
                size="icon-small"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
              >
                <X className="size-4" weight="bold" />
              </Button>
            </div>
            <nav className="flex flex-col p-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-[15px] font-medium text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-3 border-t border-(--outline) flex flex-col gap-2">
              <Button variant="outlined" size="medium" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Войти
                </Link>
              </Button>
              <Button size="medium" shape="round" asChild>
                <Link href="/app/scenarios" onClick={() => setOpen(false)}>
                  Играть
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
