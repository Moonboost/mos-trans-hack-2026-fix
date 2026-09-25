export type NodeType = "intro" | "choice" | "outcome" | "end";

export interface Choice {
  id: string;
  label: string;
  next_node_key: string | null;
}

export interface ScenarioNode {
  key: string;
  type: NodeType;
  text: string;
  media_url?: string | null;
  timer_seconds?: number | null;
  is_terminal: boolean;
  meta: Record<string, unknown>;
  choices: Choice[];
}

export interface Scenario {
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  xp_reward: number;
  start_node_key: string;
}

export interface RunState {
  run_id: string;
  status: "in_progress" | "finished" | "abandoned";
  loyalty: number;
  safety: number;
  score: number;
  node: ScenarioNode | null;
}

export interface ReportStep {
  node_key: string;
  choice_id: string;
  time_spent: number;
  overtime: number;
  loyalty: number;
  safety: number;
  competence?: string | null;
}

export interface Report {
  run_id: string;
  status: string;
  loyalty: number;
  safety: number;
  score: number;
  total_time_seconds: number;
  verdict: string;
  steps: ReportStep[];
  xp_gained: number;
  level: number;
  achievements: string[];
}

export interface GameProfile {
  user_id: string;
  xp: number;
  level: number;
  completed_scenarios: number;
  best_score: number;
  loyalty_avg: number;
  safety_avg: number;
}
