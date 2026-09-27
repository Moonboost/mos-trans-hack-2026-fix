"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchLeaderboard } from "@/entities/scenario/api/client";
import { TrophyIcon, MedalIcon, CertificateIcon, SparkleIcon } from "@phosphor-icons/react"

interface Row {
  user_id: string;
  xp: number;
  level: number;
  completed: number;
  best_score: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then((r) => setRows(Array.isArray(r) ? r : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <TrophyIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Таблица лидеров
          </h1>
          <p className="text-sm text-muted-foreground">
            Рейтинг проводников по суммарному XP
          </p>
        </div>
      </div>

      {/* Loading State (Skeleton) */}
      {loading ? (
        <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="h-4 w-8 rounded bg-muted" />
                <div className="h-4 flex-1 rounded bg-muted" />
                <div className="h-4 w-12 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* Leaderboard */
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                <SparkleIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Пока никто не играл
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Будьте первым, кто пройдёт сценарий и попадёт в таблицу лидеров
              </p>
            </div>
          ) : (
            <CardContent className="p-0">
              {/* Desktop Header */}
              <div className="hidden md:grid md:grid-cols-[4rem_1fr_5rem_6rem_7rem_5rem] items-center gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Место</span>
                <span>Проводник</span>
                <span>Уровень</span>
                <span>Сценарии</span>
                <span>Рекорд</span>
                <span className="text-right">XP</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {rows.map((r, i) => {
                  const rank = i + 1;
                  const isTop = rank <= 3;
                  const medalIcon =
                    rank === 1 ? (
                      <TrophyIcon className="h-4 w-4 text-yellow-500" />
                    ) : rank === 2 ? (
                      <MedalIcon className="h-4 w-4 text-gray-400" />
                    ) : rank === 3 ? (
                      <CertificateIcon className="h-4 w-4 text-amber-700" />
                    ) : null;

                  return (
                    <div
                      key={r.user_id}
                      className="group grid grid-cols-[3rem_1fr_auto] md:grid-cols-[4rem_1fr_5rem_6rem_7rem_5rem] items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2">
                        {medalIcon ? (
                          <span className="flex items-center justify-center">
                            {medalIcon}
                          </span>
                        ) : (
                          <span className="font-mono text-sm text-muted-foreground">
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* User ID */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-sm text-foreground truncate">
                          {r.user_id.slice(0, 8)}…
                        </span>
                        {isTop && (
                          <Badge variant="tonal-static" className="hidden sm:inline-flex">
                            топ-{rank}
                          </Badge>
                        )}
                      </div>

                      {/* Level */}
                      <div className="hidden md:block">
                        <span className="text-sm text-foreground">
                          ур. {r.level}
                        </span>
                      </div>

                      {/* Completed */}
                      <div className="hidden md:block">
                        <span className="text-sm text-muted-foreground">
                          {r.completed} сцен.
                        </span>
                      </div>

                      {/* Best Score */}
                      <div className="hidden md:block">
                        <span className="text-sm text-muted-foreground">
                          {r.best_score}
                        </span>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {r.xp} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}