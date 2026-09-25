"use client";
import { $fetch } from "@/utils/fetch";
import type { Scenario, RunState, Report, GameProfile } from "../model/types";

export async function listScenarios(): Promise<Scenario[]> {
  const res = await $fetch("/api/v1/game/scenarios", { isToast: false });
  return res?.json ?? [];
}

export async function startRun(slug: string): Promise<RunState | null> {
  const res = await $fetch(`/api/v1/game/scenarios/${slug}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  return res?.json ?? null;
}

export async function choose(runId: string, choiceId: string, timeSpent: number): Promise<RunState | null> {
  const res = await $fetch(`/api/v1/game/runs/${runId}/choose`, {
    method: "POST",
    body: JSON.stringify({ choice_id: choiceId, time_spent: timeSpent }),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  return res?.json ?? null;
}

export async function fetchReport(runId: string): Promise<Report | null> {
  const res = await $fetch(`/api/v1/game/runs/${runId}/report`, { isToast: false });
  return res?.json ?? null;
}

export async function fetchProfile(): Promise<GameProfile | null> {
  const res = await $fetch("/api/v1/game/me", { isToast: false });
  return res?.json ?? null;
}

export async function fetchLeaderboard() {
  const res = await $fetch("/api/v1/game/leaderboard", { isToast: false });
  return res?.json ?? [];
}
