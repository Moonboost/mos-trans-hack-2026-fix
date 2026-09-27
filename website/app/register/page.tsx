"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { $fetch } from "@/utils/fetch";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthInput,
  AuthLabel,
  AuthError,
  AuthSubmit,
} from "@/components/auth/auth-field";

const schema = z
  .object({
    email: z.string().email("Некорректный email"),
    password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
      .regex(/[0-9]/, "Нужна хотя бы одна цифра"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Пароли не совпадают",
  });

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const parsed = schema.safeParse({ email, password, confirm });
    if (!parsed.success) {
      const field: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) field[i.path[0] as string] = i.message;
      });
      setErrors(field);
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/register/email", {
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
        toast.error(res.json?.message || "Не удалось создать аккаунт");
      }
      setLoading(false);
      return;
    }

    // Backend creates the user with verified=false and emails an OTP.
    // Hand the user off to /verify-email with the email in the query.
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthShell
      title="Создать аккаунт"
      subtitle="Регистрация для проводников ВСМ-400. Пришлём код на почту."
      footer={
        <p className="text-[13px] text-(--on-bg-medium)">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-(--brand-9) hover:underline underline-offset-4 font-medium"
          >
            Войти
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
          <AuthLabel htmlFor="password">Пароль</AuthLabel>
          <AuthInput
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          <AuthError>{errors.password}</AuthError>
        </div>

        <div>
          <AuthLabel htmlFor="confirm">Повторите пароль</AuthLabel>
          <AuthInput
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!errors.confirm}
          />
          <AuthError>{errors.confirm}</AuthError>
        </div>

        <AuthSubmit type="submit" loading={loading}>
          Создать аккаунт
        </AuthSubmit>

        <p className="text-[11px] text-(--on-bg-low) leading-relaxed pt-1">
          Продолжая, вы соглашаетесь с правилами хакатона и обработкой
          персональных данных. Данные хранятся локально и не передаются
          третьим лицам.
        </p>
      </form>
    </AuthShell>
  );
}
