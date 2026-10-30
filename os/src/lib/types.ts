// Shared domain types for Oogstweb OS. Mirrors supabase/migrations/0001_init.sql.

export type CompanyType = "lead" | "client" | "archived";
export type WebsiteStatus = "geen" | "verouderd" | "matig" | "goed" | "onbekend";
export type PipelineStage = "nieuw" | "gecontacteerd" | "offerte" | "klant" | "verloren";

export interface ResearchSource {
  label: string;
  url?: string;
  checked_at: string;
}

export interface Company {
  id: string;
  type: CompanyType;
  name: string;
  city: string | null;
  industry: string | null;
  website_url: string | null;
  website_status: WebsiteStatus | null;
  phone: string | null;
  email: string | null;
  kvk_number: string | null;
  kvk_verified: boolean;
  opportunity_score: number | null;
  pipeline_stage: PipelineStage;
  source: string | null;
  research_sources: ResearchSource[];
  website_recommendation: string | null;
  notes: string | null;
  last_verified_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
}

export type InteractionKind = "notitie" | "email" | "telefoon" | "vergadering" | "systeem";

export interface Interaction {
  id: string;
  company_id: string;
  kind: InteractionKind;
  content: string;
  created_by: string | null;
  agent_run_id: string | null;
  created_at: string;
}

export type ProjectType = "website" | "webshop" | "onderhoud" | "overig";
export type ProjectStatus = "intake" | "ontwerp" | "ontwikkeling" | "review" | "live" | "onderhoud";

export interface Project {
  id: string;
  company_id: string | null;
  name: string;
  project_type: ProjectType;
  status: ProjectStatus;
  budget: number | null;
  start_date: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "open" | "in_uitvoering" | "klaar";
export type TaskPriority = "laag" | "normaal" | "hoog";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  related_company_id: string | null;
  related_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  location: string | null;
  related_company_id: string | null;
  created_at: string;
}

export type QuoteStatus = "concept" | "verzonden" | "geaccepteerd" | "afgewezen";

export interface QuoteItem {
  description: string;
  amount: number;
}

export interface Quote {
  id: string;
  company_id: string | null;
  number: string;
  status: QuoteStatus;
  amount: number;
  valid_until: string | null;
  items: QuoteItem[];
  created_at: string;
}

export type InvoiceStatus = "concept" | "verzonden" | "betaald" | "te_laat";

export interface Invoice {
  id: string;
  company_id: string | null;
  quote_id: string | null;
  number: string;
  status: InvoiceStatus;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export type FinancialEntryType = "inkomst" | "uitgave";

export interface FinancialEntry {
  id: string;
  entry_type: FinancialEntryType;
  category: string;
  description: string | null;
  amount: number;
  entry_date: string;
  related_invoice_id: string | null;
  created_at: string;
}

export type GoalStatus = "actief" | "behaald" | "gestopt";

export interface BusinessGoal {
  id: string;
  title: string;
  description: string | null;
  metric_target: number | null;
  metric_current: number;
  unit: string | null;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
}

export type AgentRole =
  | "ceo"
  | "lead_research"
  | "sales"
  | "marketing"
  | "finance"
  | "project_manager"
  | "web_expert"
  | "quality_controller";

export type PermissionTier = 1 | 2 | 3;

export type AgentRunStatus =
  | "automatisch_uitgevoerd"
  | "wacht_op_goedkeuring"
  | "goedgekeurd"
  | "afgewezen"
  | "mislukt";

export interface AgentRun {
  id: string;
  agent_role: AgentRole;
  action: string;
  permission_tier: PermissionTier;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: AgentRunStatus;
  related_company_id: string | null;
  error: string | null;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export type ApprovalStatus = "open" | "goedgekeurd" | "afgewezen";

export interface Approval {
  id: string;
  agent_run_id: string;
  summary: string;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}
