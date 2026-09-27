"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CircleNotchIcon, Train } from "@phosphor-icons/react"
import { useUser } from "@/entities/user/model/user-context"

/**
 * Auth gate for /app/* routes.
 *
 * Three explicit states — never a silent blank page:
 *   1. isLoading  → full-page loader
 *   2. !user      → "redirecting to login" hint (router fires in effect)
 *   3. user       → children
 */
export function CheckUser({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      const from =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/app/scenarios"
      router.replace(`/login?from=${encodeURIComponent(from)}`)
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-2 text-(--on-bg-low)">
          <CircleNotchIcon className="size-4 animate-spin" />
          <span className="text-body-4">Загрузка…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-(--brand-9) text-white">
            <Train className="size-5" weight="fill" />
          </span>
          <p className="text-body-3 text-(--on-bg-medium)">
            Требуется вход. Перенаправляем на страницу входа…
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
