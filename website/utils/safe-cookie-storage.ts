import Cookies from 'js-cookie';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
// No env -> no domain attribute (cookie binds to exact host, works on IP too)
const COOKIE_DOMAIN = ROOT && ROOT !== "localhost" ? "." + ROOT : undefined;

export const safeCookieStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === "undefined") return null
        try {
            return Cookies.get(key) || null
        } catch {
            return null
        }
    },
    setItem: (key: string, value: string | number, expiresDays: number = 7): void => {
        if (typeof window === "undefined") return
        try {
            Cookies.set(key, String(value), {
                expires: expiresDays,
                ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
                path: '/',
                sameSite: 'Lax'
            })
        } catch {}
    },
    removeItem: (key: string): void => {
        if (typeof window === "undefined") return
        try {
            Cookies.remove(key, { ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}), path: '/' })
        } catch {}
    }
}
