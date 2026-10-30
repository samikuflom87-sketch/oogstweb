import type {
  AgentRun,
  Appointment,
  Approval,
  BusinessGoal,
  Company,
  Contact,
  FinancialEntry,
  Interaction,
  Invoice,
  Project,
  Quote,
  Task,
} from "@/lib/types";

export interface CompanyFilter {
  city?: string;
  industry?: string;
  websiteStatus?: string;
  pipelineStage?: string;
  type?: string;
  search?: string;
}

/**
 * Every persistence operation Oogstweb OS needs, implemented either against
 * Supabase (when configured) or against an in-browser demo store. UI code
 * never talks to Supabase or localStorage directly — only through this
 * interface — so the two modes stay interchangeable.
 */
export interface DataProvider {
  readonly mode: "supabase" | "demo";

  listCompanies(filter?: CompanyFilter): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  createCompany(input: Partial<Company> & { name: string }): Promise<Company>;
  updateCompany(id: string, patch: Partial<Company>): Promise<Company>;

  listContacts(companyId: string): Promise<Contact[]>;
  createContact(input: Partial<Contact> & { company_id: string; name: string }): Promise<Contact>;

  listInteractions(companyId: string): Promise<Interaction[]>;
  addInteraction(
    input: Partial<Interaction> & { company_id: string; kind: Interaction["kind"]; content: string }
  ): Promise<Interaction>;

  listProjects(): Promise<Project[]>;
  createProject(input: Partial<Project> & { name: string }): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project>;

  listTasks(): Promise<Task[]>;
  createTask(input: Partial<Task> & { title: string }): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task>;

  listAppointments(): Promise<Appointment[]>;
  createAppointment(
    input: Partial<Appointment> & { title: string; start_at: string; end_at: string }
  ): Promise<Appointment>;

  listQuotes(): Promise<Quote[]>;
  createQuote(input: Partial<Quote> & { number: string; amount: number }): Promise<Quote>;
  updateQuote(id: string, patch: Partial<Quote>): Promise<Quote>;

  listInvoices(): Promise<Invoice[]>;
  createInvoice(input: Partial<Invoice> & { number: string; amount: number }): Promise<Invoice>;
  updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice>;

  listFinancialEntries(): Promise<FinancialEntry[]>;
  createFinancialEntry(
    input: Partial<FinancialEntry> & { entry_type: FinancialEntry["entry_type"]; category: string; amount: number }
  ): Promise<FinancialEntry>;

  listGoals(): Promise<BusinessGoal[]>;
  createGoal(input: Partial<BusinessGoal> & { title: string }): Promise<BusinessGoal>;
  updateGoal(id: string, patch: Partial<BusinessGoal>): Promise<BusinessGoal>;

  listAgentRuns(): Promise<AgentRun[]>;
  createAgentRun(
    input: Partial<AgentRun> & {
      agent_role: AgentRun["agent_role"];
      action: string;
      permission_tier: AgentRun["permission_tier"];
    }
  ): Promise<AgentRun>;

  listApprovals(): Promise<Approval[]>;
  decideApproval(id: string, decision: "goedgekeurd" | "afgewezen"): Promise<Approval>;

  resetDemoData?(): Promise<void>;
}
