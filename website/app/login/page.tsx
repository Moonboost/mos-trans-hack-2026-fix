"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
import { useUser } from "@/entities/user/model/user-context";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
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

    // Client-side validation with Zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/login/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    // Handle 5xx (server errors)
    if (res.response && res.response.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
      setLoading(false);
      return;
    }

    // Handle non-OK responses (401, 403, 404, 422, etc.)
    if (!res.response?.ok) {
      // If 422 and detail is an array (FastAPI validation)
      if (res.response?.status === 422 && Array.isArray(res.json?.detail)) {
        const fieldErrors: Record<string, string> = {};
        res.json.detail.forEach((err: any) => {
          const loc = err.loc;
          if (loc && loc.length > 1) {
            const field = loc[1];
            fieldErrors[field] = err.msg;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Non‑422 errors: show toast or message
        toast.error(res.json?.message || "Ошибка входа");
      }
      setLoading(false);
      return;
    }

    // Success: store tokens and redirect
    safeCookieStorage.setItem("access_token", res.json.access_token);
    safeCookieStorage.setItem("refresh_token", res.json.refresh_token);
    setToken(res.json.access_token);
    toast.success("Добро пожаловать!");
    router.push("/app/scenarios");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Вход в систему
          </h1>
          <p className="text-sm text-muted-foreground">
            Введите свои учетные данные для доступа к панели управления
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className="h-11"
              />
              <FieldError errors={errors.email ? [{ message: errors.email }] : []} />
            </Field>

            <Field>
              <FieldLabel>Пароль</FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                className="h-11"
              />
              <FieldError errors={errors.password ? [{ message: errors.password }] : []} />
            </Field>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-11 text-base font-medium rounded-xl"
            >
              {loading ? "Выполняется вход..." : "Войти"}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground">
          Защищенное соединение. Ваши данные в безопасности.
        </p>
      </div>
    </div>
  );
}