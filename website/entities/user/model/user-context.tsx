"use client"

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { fetchMe } from "@/entities/user/api/fetch-me"
import { getTokenExpiration } from "@/utils/get-token-expiration"
import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

interface UserContextType {
  user: any
  setUser: (user: any) => void
  token: string | null
  setToken: (token: string | null) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // Guards against React StrictMode's double-effect invocation in dev,
  // and against multiple concurrent refreshes on rapid navigations.
  const initRef = useRef(false)

  const getUser = useCallback(async () => {
    setIsLoading(true)
    const user_ = await fetchMe()
    setUser(user_)
    setIsLoading(false)
  }, [])

  function clearAuth() {
    safeCookieStorage.removeItem("access_token")
    safeCookieStorage.removeItem("refresh_token")
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    ;(async () => {
      const refresh_token = safeCookieStorage.getItem("refresh_token")
      const access_token = safeCookieStorage.getItem("access_token")

      if (!refresh_token || !access_token) {
        setIsLoading(false)
        return
      }

      const expTime = getTokenExpiration(access_token)
      const isExpired = expTime ? Date.now() >= expTime : true

      if (!isExpired) {
        setToken(access_token)
        return
      }

      // Access token expired — try one refresh.
      const res = await $fetch("/api/v1/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      })

      const new_access = res?.json?.access_token
      if (new_access) {
        safeCookieStorage.setItem("access_token", new_access)
        setToken(new_access)
      } else {
        // Refresh failed (network, 400, 401) — drop the session so
        // CheckUser can route to /login instead of hanging on a
        // spinner forever.
        clearAuth()
      }
    })()
  }, [])

  useEffect(() => {
    if (token) {
      safeCookieStorage.setItem("access_token", token)
      getUser()
    }
  }, [token, getUser])

  async function logout() {
    const refresh_token = safeCookieStorage.getItem("refresh_token")
    await $fetch("/api/v1/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    })
    clearAuth()
    router.push("/login")
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, token, setToken, isLoading, setIsLoading, logout }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
