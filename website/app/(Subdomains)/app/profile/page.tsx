"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { User, EnvelopeIcon, FloppyDiskIcon, X, Pencil } from "@phosphor-icons/react";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!user) return null;

  async function handleSave() {
    setErrors({});
    setLoading(true);

    // Простая клиентская валидация
    if (!name.trim()) {
      setErrors({ name: "Имя обязательно для заполнения" });
      setLoading(false);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrors({ email: "Введите корректный email" });
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify({ name, email }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    if (res.response?.status === 401) {
      router.push("/login");
      return;
    }

    if (res.response && res.response.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
      setLoading(false);
      return;
    }

    if (res.response?.ok) {
      toast.success("Профиль успешно обновлен");
      setEditing(false);
    } else {
      toast.error(res.json?.message || "Не удалось обновить профиль");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Профиль
            </h1>
            <p className="text-sm text-muted-foreground">
              Управление личной информацией и настройками аккаунта
            </p>
          </div>
        </div>
        {!editing && (
          <Button variant="outlined" size="default" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Редактировать
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        {!editing ? (
          <CardContent className="p-0 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Имя
                </div>
                <p className="text-lg font-medium text-foreground">
                  {user.name || "Не указано"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <EnvelopeIcon className="h-4 w-4" />
                  Email
                </div>
                <p className="text-lg font-medium text-foreground break-all">
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <Field>
              <FieldLabel>Имя</FieldLabel>
              <Input
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                className="h-11"
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : []} />
            </Field>

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

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 sm:flex-none gap-2 rounded-xl"
              >
                {loading ? (
                  <>Сохранение...</>
                ) : (
                  <>
                    <FloppyDiskIcon className="h-4 w-4" />
                    Сохранить изменения
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setEditing(false);
                  setName(user.name || "");
                  setEmail(user.email || "");
                  setErrors({});
                }}
                className="h-11 flex-1 sm:flex-none gap-2 rounded-xl"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Отмена
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}