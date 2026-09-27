"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchLeaderboard } from "@/entities/scenario/api/client";

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
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-display-2 mb-2">Таблица лидеров</h1>
        <p className="text-(--on-bg-medium) text-body-3">
          Рейтинг проводников по суммарному XP.
        </p>
      </div>
      {loading && <p className="text-(--on-bg-medium)">Загрузка…</p>}
      {!loading && (
        <Card className="divide-y divide-(--outline)">
          {rows.map((r, i) => (
            <div key={r.user_id} className="flex items-center gap-4 p-4">
              <span className="font-mono text-(--on-bg-low) w-8">#{i + 1}</span>
              <span className="font-mono text-body-5 flex-1 truncate">{r.user_id.slice(0, 8)}…</span>
              <span className="text-body-5">ур. {r.level}</span>
              <span className="text-body-5">{r.completed} сцен.</span>
              <span className="text-body-5">рекорд {r.best_score}</span>
              <span className="font-mono text-(--on-bg-high)">{r.xp} XP</span>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-4 text-(--on-bg-medium)">Пока никто не играл.</p>
          )}
        </Card>
      )}
    </div>
  );
}
