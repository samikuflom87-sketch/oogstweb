import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
import type { CompanyFilter, DataProvider } from "@/lib/data/provider";

function assertOk<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("Geen data ontvangen van Supabase.");
  return res.data;
}

export function createSupabaseProvider(): DataProvider {
  const sb = () => getSupabaseBrowserClient();

  return {
    mode: "supabase",

    async listCompanies(filter) {
      let query = sb().from("companies").select("*").order("updated_at", { ascending: false });
      if (filter?.city) query = query.ilike("city", filter.city);
      if (filter?.industry) query = query.ilike("industry", filter.industry);
      if (filter?.websiteStatus) query = query.eq("website_status", filter.websiteStatus);
      if (filter?.pipelineStage) query = query.eq("pipeline_stage", filter.pipelineStage);
      if (filter?.type) query = query.eq("type", filter.type);
      if (filter?.search) query = query.ilike("name", `%${filter.search}%`);
      const res = await query;
      return assertOk(res) as Company[];
    },
    async getCompany(id) {
      const res = await sb().from("companies").select("*").eq("id", id).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as Company) ?? null;
    },
    async createCompany(input) {
      const res = await sb().from("companies").insert(input).select("*").single();
      return assertOk(res) as Company;
    },
    async updateCompany(id, patch) {
      const res = await sb()
        .from("companies")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      return assertOk(res) as Company;
    },

    async listContacts(companyId) {
      const res = await sb().from("contacts").select("*").eq("company_id", companyId);
      return assertOk(res) as Contact[];
    },
    async createContact(input) {
      const res = await sb().from("contacts").insert(input).select("*").single();
      return assertOk(res) as Contact;
    },

    async listInteractions(companyId) {
      const res = await sb()
        .from("interactions")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      return assertOk(res) as Interaction[];
    },
    async addInteraction(input) {
      const res = await sb().from("interactions").insert(input).select("*").single();
      return assertOk(res) as Interaction;
    },

    async listProjects() {
      const res = await sb().from("projects").select("*").order("updated_at", { ascending: false });
      return assertOk(res) as Project[];
    },
    async createProject(input) {
      const res = await sb().from("projects").insert(input).select("*").single();
      return assertOk(res) as Project;
    },
    async updateProject(id, patch) {
      const res = await sb()
        .from("projects")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      return assertOk(res) as Project;
    },

    async listTasks() {
      const res = await sb().from("tasks").select("*").order("due_date", { ascending: true });
      return assertOk(res) as Task[];
    },
    async createTask(input) {
      const res = await sb().from("tasks").insert(input).select("*").single();
      return assertOk(res) as Task;
    },
    async updateTask(id, patch) {
      const res = await sb()
        .from("tasks")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      return assertOk(res) as Task;
    },

    async listAppointments() {
      const res = await sb().from("appointments").select("*").order("start_at", { ascending: true });
      return assertOk(res) as Appointment[];
    },
    async createAppointment(input) {
      const res = await sb().from("appointments").insert(input).select("*").single();
      return assertOk(res) as Appointment;
    },

    async listQuotes() {
      const res = await sb().from("quotes").select("*").order("created_at", { ascending: false });
      return assertOk(res) as Quote[];
    },
    async createQuote(input) {
      const res = await sb().from("quotes").insert(input).select("*").single();
      return assertOk(res) as Quote;
    },
    async updateQuote(id, patch) {
      const res = await sb().from("quotes").update(patch).eq("id", id).select("*").single();
      return assertOk(res) as Quote;
    },

    async listInvoices() {
      const res = await sb().from("invoices").select("*").order("created_at", { ascending: false });
      return assertOk(res) as Invoice[];
    },
    async createInvoice(input) {
      const res = await sb().from("invoices").insert(input).select("*").single();
      return assertOk(res) as Invoice;
    },
    async updateInvoice(id, patch) {
      const res = await sb().from("invoices").update(patch).eq("id", id).select("*").single();
      return assertOk(res) as Invoice;
    },

    async listFinancialEntries() {
      const res = await sb().from("financial_entries").select("*").order("entry_date", { ascending: false });
      return assertOk(res) as FinancialEntry[];
    },
    async createFinancialEntry(input) {
      const res = await sb().from("financial_entries").insert(input).select("*").single();
      return assertOk(res) as FinancialEntry;
    },

    async listGoals() {
      const res = await sb().from("business_goals").select("*");
      return assertOk(res) as BusinessGoal[];
    },
    async createGoal(input) {
      const res = await sb().from("business_goals").insert(input).select("*").single();
      return assertOk(res) as BusinessGoal;
    },
    async updateGoal(id, patch) {
      const res = await sb().from("business_goals").update(patch).eq("id", id).select("*").single();
      return assertOk(res) as BusinessGoal;
    },

    async listAgentRuns() {
      const res = await sb().from("agent_runs").select("*").order("created_at", { ascending: false });
      return assertOk(res) as AgentRun[];
    },
    async createAgentRun(input) {
      const status = input.status ?? (input.permission_tier === 1 ? "automatisch_uitgevoerd" : "wacht_op_goedkeuring");
      const res = await sb()
        .from("agent_runs")
        .insert({ ...input, status })
        .select("*")
        .single();
      const run = assertOk(res) as AgentRun;
      if (status === "wacht_op_goedkeuring") {
        await sb().from("approvals").insert({
          agent_run_id: run.id,
          summary: `${run.agent_role} wil "${run.action}" uitvoeren en wacht op goedkeuring.`,
          payload: run.input,
          status: "open",
        });
      }
      return run;
    },

    async listApprovals() {
      const res = await sb().from("approvals").select("*").order("created_at", { ascending: false });
      return assertOk(res) as Approval[];
    },
    async decideApproval(id, decision) {
      const nowIso = new Date().toISOString();
      const res = await sb()
        .from("approvals")
        .update({ status: decision, decided_at: nowIso })
        .eq("id", id)
        .select("*")
        .single();
      const approval = assertOk(res) as Approval;
      await sb()
        .from("agent_runs")
        .update({ status: decision, decided_at: nowIso })
        .eq("id", approval.agent_run_id);
      return approval;
    },
  };
}
