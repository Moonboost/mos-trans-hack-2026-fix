"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DualScale } from "@/components/game/DualScale";
import { fetchReport } from "@/entities/scenario/api/client";
import type { Report } from "@/entities/scenario/model/types";

export default function ReportPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const runId = sp.get("run");
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (runId) fetchReport(runId).then(setReport);
  }, [runId]);

  if (!runId) return <p>Нет идентификатора прогона.</p>;
  if (!report) return <p className="text-(--on-bg-medium)">Готовим разбор…</p>;

  const competences = new Set<string>();
  report.steps.forEach((s) => s.competence && competences.add(s.competence));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="p-6 space-y-4">
        <h1 className="text-display-3">Разбор сценария</h1>
        <p className="text-body-2">{report.verdict}</p>
        <DualScale loyalty={report.loyalty} safety={report.safety} />
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="tonal-static">Счёт: {report.score}</Badge>
          <Badge variant="tonal-static">+{report.xp_gained} XP</Badge>
          <Badge variant="tonal-static">Уровень: {report.level}</Badge>
          <Badge variant="tonal-static">{report.total_time_seconds} с</Badge>
        </div>
        {report.achievements.length > 0 && (
          <div className="pt-2">
            <p className="text-body-5 text-(--on-bg-medium) mb-2">Новые достижения</p>
            <div className="flex flex-wrap gap-2">
              {report.achievements.map((a) => <Badge key={a} variant="selected-static">{a}</Badge>)}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-heading-3">Шаги</h2>
        <ol className="space-y-3">
          {report.steps.map((s, i) => (
            <li key={i} className="border-l-2 pl-4 border-(--outline)">
              <p className="text-body-4">
                Узел <span className="font-mono">{s.node_key}</span> — время{" "}
                <span className="font-mono">{s.time_spent}с</span>
                {s.overtime > 0 && (
                  <span className="text-(--red-7)"> · просрочка {s.overtime}с</span>
                )}
              </p>
              <p className="text-body-5 text-(--on-bg-medium)">
                Лояльность {s.loyalty} · Безопасность {s.safety}
                {s.competence && <> · компетенция: <span className="font-mono">{s.competence}</span></>}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex gap-3">
        <Button variant="outlined" onClick={() => router.push("/app/scenarios")}>
          К списку сценариев
        </Button>
        <Button onClick={() => router.push("/app/leaderboard")}>
          Таблица лидеров
        </Button>
      </div>
    </div>
  );
}
