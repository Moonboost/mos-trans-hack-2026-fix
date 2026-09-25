"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DualScale } from "@/components/game/DualScale";
import { startRun, choose as apiChoose } from "@/entities/scenario/api/client";
import type { RunState } from "@/entities/scenario/model/types";
import { cn } from "@/lib/utils";

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const ratio = total > 0 ? Math.max(0, seconds / total) : 0;
  const critical = seconds <= 5;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative size-16 shrink-0", critical && "animate-pulse")}>
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--gray-3)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={critical ? "var(--red-7)" : "var(--brand-9)"}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-body-3">
        {seconds}
      </span>
    </div>
  );
}

export default function PlayPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [run, setRun] = useState<RunState | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const nodeStartRef = useRef<number>(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startRun(params.slug).then((r) => {
      setRun(r);
      if (r?.node?.timer_seconds) setSecondsLeft(r.node.timer_seconds);
      nodeStartRef.current = Date.now();
    });
  }, [params.slug]);

  // Timer tick
  useEffect(() => {
    if (!run?.node?.timer_seconds) return;
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [run?.node?.timer_seconds, secondsLeft]);

  const onChoose = useCallback(async (choiceId: string) => {
    if (!run || loading) return;
    setLoading(true);
    const timeSpent = Math.round((Date.now() - nodeStartRef.current) / 1000);
    const next = await apiChoose(run.run_id, choiceId, timeSpent);
    setLoading(false);
    if (!next) return;
    setRun(next);
    nodeStartRef.current = Date.now();
    if (next.node?.timer_seconds) setSecondsLeft(next.node.timer_seconds);
    else setSecondsLeft(0);
    if (next.status === "finished") {
      router.push(`/app/scenarios/${params.slug}/report?run=${next.run_id}`);
    }
  }, [run, loading, router, params.slug]);

  if (!run) return <p className="text-(--on-bg-medium)">Загрузка сценария…</p>;
  if (!run.node) return <p>Узел не найден.</p>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="p-6 space-y-4">
        <DualScale loyalty={run.loyalty} safety={run.safety} />
        <div className="flex items-center justify-between text-body-5 text-(--on-bg-low)">
          <span>Счёт: <span className="font-mono text-(--on-bg-high)">{run.score}</span></span>
          <span>Узел: <span className="font-mono">{run.node.key}</span></span>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          {run.node.timer_seconds ? (
            <TimerRing seconds={secondsLeft} total={run.node.timer_seconds} />
          ) : null}
          <p className="text-body-2 leading-relaxed flex-1">{run.node.text}</p>
        </div>

        <div className="grid gap-2">
          {run.node.choices.map((c) => (
            <Button
              key={c.id}
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={() => onChoose(c.id)}
              className="justify-start text-left whitespace-normal h-auto py-3"
            >
              {c.label}
            </Button>
          ))}
        </div>

        {run.node.timer_seconds && secondsLeft === 0 && (
          <p className="text-body-5 text-(--red-7)">
            Время вышло — засчитан штраф к рейтингу безопасности. Выберите вариант.
          </p>
        )}
      </Card>
    </div>
  );
}
