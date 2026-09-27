"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listScenarios } from "@/entities/scenario/api/client";
import type { Scenario } from "@/entities/scenario/model/types";
import { Trophy, Target } from "lucide-react";

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
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Сценарии
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Каждый сценарий — нелинейный диалог с таймером и двумя шкалами: лояльность пассажира и рейтинг безопасности.
        </p>
      </div>

      {/* Loading State (Skeleton) */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : (
        /* Scenarios Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <Card 
              key={s.slug} 
              className="group flex flex-col gap-4 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-accent/50"
            >
              <CardHeader className="p-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                    {s.title}
                  </CardTitle>
                  <Badge variant="tonal-static" className="shrink-0">
                    {CATEGORY_LABEL[s.category] ?? s.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </CardContent>

              <CardFooter className="p-0 flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    +{s.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {s.difficulty}
                  </span>
                </div>
                <Button asChild size="sm" className="rounded-lg">
                  <Link href={`/app/scenarios/${s.slug}/play`}>
                    Начать
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}