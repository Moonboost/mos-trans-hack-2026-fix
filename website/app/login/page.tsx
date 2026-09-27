"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { $fetch } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
import { useUser } from "@/entities/user/model/user-context";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthInput,
  AuthLabel,
  AuthError,
  AuthSubmit,
} from "@/components/auth/auth-field";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const field: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) field[i.path[0] as string] = i.message;
      });
      setErrors(field);
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/login/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    if (res.response && res.response.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
      setLoading(false);
      return;
    }

    if (!res.response?.ok) {
      if (res.response?.status === 422 && Array.isArray(res.json?.detail)) {
        const field: Record<string, string> = {};
        res.json.detail.forEach((err: any) => {
          const loc = err.loc;
          if (loc && loc.length > 1) field[loc[1]] = err.msg;
        });
        setErrors(field);
      } else {
        toast.error(res.json?.message || "Не удалось войти");
      }
      setLoading(false);
      return;
    }

    safeCookieStorage.setItem("access_token", res.json.access_token);
    safeCookieStorage.setItem("refresh_token", res.json.refresh_token);
    setToken(res.json.access_token);
    router.push("/app/scenarios");
  }

  return (
    <AuthShell
      title="Вход в систему"
      subtitle="Используйте рабочую почту, чтобы продолжить обучение."
      footer={
        <p className="text-[13px] text-(--on-bg-medium)">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-(--brand-9) hover:underline underline-offset-4 font-medium"
          >
            Создать
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          <AuthError>{errors.email}</AuthError>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <AuthLabel htmlFor="password" className="mb-0">
              Пароль
            </AuthLabel>
            <Link
              href="/reset"
              className="text-[11px] text-(--on-bg-low) hover:text-(--on-bg-high)"
            >
              Забыли?
            </Link>
          </div>
          <AuthInput
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          <AuthError>{errors.password}</AuthError>
        </div>

        <AuthSubmit type="submit" loading={loading}>
          Войти
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
