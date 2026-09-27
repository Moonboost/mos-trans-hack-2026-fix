"use client"

import { useEffect, useState } from "react"
import { Monitor, Sun, Moon } from "@phosphor-icons/react"
import { useTheme } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"

/**
 * Three-state theme toggle (system / light / dark).
 * Icons are Phosphor, which renders fill="currentColor" — so the
 * active state is controlled by `text-*` on the button, not stroke.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const options = [
    { value: "system", icon: Monitor, label: "Системная" },
    { value: "light",  icon: Sun,     label: "Светлая" },
    { value: "dark",   icon: Moon,    label: "Тёмная" },
  ] as const

  return (
    <div
      role="group"
      aria-label="Тема оформления"
      className="inline-flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--bg) p-0.5"
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "group relative grid size-8 place-items-center rounded-full outline-none transition-colors",
              isActive
                ? "bg-(--on-bg-high) text-(--bg)"
                : "text-(--on-bg-low) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            )}
          >
            <Icon className="size-4" weight={isActive ? "fill" : "regular"} />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
