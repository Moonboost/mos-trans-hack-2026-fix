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
export type NodeType = "intro" | "choice" | "outcome" | "end";
export type RoleStep = "admit" | "state_rule" | "offer_solution" | "reassure";
export type ServiceClass = "standard" | "comfort" | "business" | "first" | "any";

export interface Choice {
  id: string;
  label: string;
  next_node_key: string | null;
  role_step?: RoleStep | null;
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
  service_class: ServiceClass;
  passenger_type: string;
  stage: string;
  regulatory_ref?: string | null;
  difficulty: string;
  xp_reward: number;
  start_node_key: string;
  timer_seconds?: number | null;
}

export interface RunState {
  run_id: string;
  status: "in_progress" | "finished" | "abandoned" | "failed";
  loyalty: number;
  safety: number;
  score: number;
  service_class: ServiceClass;
  role_steps_seen: RoleStep[];
  node: ScenarioNode | null;
}

export interface ReportStep {
  node_key: string;
  choice_id: string;
  role_step?: RoleStep | null;
  time_spent: number;
  overtime: number;
  role_penalty: number;
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
  role_steps_seen: RoleStep[];
  role_model_complete: boolean;
  steps: ReportStep[];
  xp_gained: number;
  level: number;
  achievements: string[];
  scenario?: { slug: string; title: string; service_class: string;
               passenger_type: string; regulatory_ref?: string | null };
}
