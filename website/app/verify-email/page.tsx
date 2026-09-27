"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setToken } = useUser();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!email.trim() || !code.trim()) {
      setErrors({
        email: !email.trim() ? "Введите email" : "",
        code: !code.trim() ? "Введите код из письма" : "",
      });
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    if (res.response && res.response.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
      setLoading(false);
      return;
    }

    if (!res.response?.ok) {
      toast.error(res.json?.detail || "Не удалось подтвердить код");
      setLoading(false);
      return;
    }

    safeCookieStorage.setItem("access_token", res.json.access_token);
    safeCookieStorage.setItem("refresh_token", res.json.refresh_token);
    setToken(res.json.access_token);
    toast.success("Аккаунт подтверждён");
    router.push("/app/scenarios");
  }

  async function handleResend() {
    if (!email.trim()) {
      setErrors({ email: "Сначала введите email" });
      return;
    }
    setResending(true);
    const res = await $fetch("/api/v1/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });
    setResending(false);
    if (res.response?.ok) {
      toast.success("Код отправлен повторно");
    } else {
      toast.error(res.json?.detail || "Не удалось отправить код");
    }
  }

  return (
    <AuthShell
      title="Подтвердите email"
      subtitle="Мы отправили шестизначный код на указанную почту."
      footer={
        <p className="text-[13px] text-(--on-bg-medium)">
          Не тот адрес?{" "}
          <Link
            href="/register"
            className="text-(--brand-9) hover:underline underline-offset-4 font-medium"
          >
            Изменить
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
          <AuthLabel htmlFor="code">Код из письма</AuthLabel>
          <AuthInput
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="font-mono tracking-[0.4em] text-center text-[15px]"
            aria-invalid={!!errors.code}
          />
          <AuthError>{errors.code}</AuthError>
        </div>

        <AuthSubmit type="submit" loading={loading}>
          Подтвердить
        </AuthSubmit>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full h-9 rounded-md border border-(--outline) text-[13px] text-(--on-bg-medium) hover:text-(--on-bg-high) transition-colors disabled:opacity-50"
        >
          {resending ? "Отправка…" : "Отправить код повторно"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
