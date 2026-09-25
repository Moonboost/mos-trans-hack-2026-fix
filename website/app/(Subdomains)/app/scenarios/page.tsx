"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listScenarios } from "@/entities/scenario/api/client";
import type { Scenario } from "@/entities/scenario/model/types";

const CATEGORY_LABEL: Record<string, string> = {
  conflict: "Конфликт",
  medical: "Медицина",
  service: "Сервис",
};

export default function ScenariosPage() {
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listScenarios()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-2 mb-2">Сценарии</h1>
        <p className="text-(--on-bg-medium) text-body-3">
          Каждый сценарий — нелинейный диалог с таймером и двумя шкалами: лояльность пассажира и рейтинг безопасности.
        </p>
      </div>

      {loading && <p className="text-(--on-bg-medium)">Загрузка…</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => (
          <Card key={s.slug} className="p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-heading-3">{s.title}</h2>
              <Badge variant="tonal-static">{CATEGORY_LABEL[s.category] ?? s.category}</Badge>
            </div>
            <p className="text-body-4 text-(--on-bg-medium) flex-1">{s.description}</p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-body-5 text-(--on-bg-low)">+{s.xp_reward} XP · {s.difficulty}</span>
              <Button asChild size="small">
                <Link href={`/app/scenarios/${s.slug}/play`}>Начать</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
