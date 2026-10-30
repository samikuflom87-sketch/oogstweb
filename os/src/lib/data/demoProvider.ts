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
import {
  demoAgentRuns,
  demoApprovals,
  demoAppointments,
  demoCompanies,
  demoContacts,
  demoFinancialEntries,
  demoGoals,
  demoInteractions,
  demoInvoices,
  demoProjects,
  demoQuotes,
  demoTasks,
} from "@/lib/data/demoSeed";
import type { CompanyFilter, DataProvider } from "@/lib/data/provider";

interface DemoState {
  companies: Company[];
  contacts: Contact[];
  interactions: Interaction[];
  projects: Project[];
  tasks: Task[];
  appointments: Appointment[];
  quotes: Quote[];
  invoices: Invoice[];
  financialEntries: FinancialEntry[];
  goals: BusinessGoal[];
  agentRuns: AgentRun[];
  approvals: Approval[];
}

const STORAGE_KEY = "oogstweb-os-demo-store-v1";

function freshState(): DemoState {
  return {
    companies: structuredClone(demoCompanies),
    contacts: structuredClone(demoContacts),
    interactions: structuredClone(demoInteractions),
    projects: structuredClone(demoProjects),
    tasks: structuredClone(demoTasks),
    appointments: structuredClone(demoAppointments),
    quotes: structuredClone(demoQuotes),
    invoices: structuredClone(demoInvoices),
    financialEntries: structuredClone(demoFinancialEntries),
    goals: structuredClone(demoGoals),
    agentRuns: structuredClone(demoAgentRuns),
    approvals: structuredClone(demoApprovals),
  };
}

let memoryState: DemoState | null = null;

function hasLocalStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function loadState(): DemoState {
  if (memoryState) return memoryState;
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryState = JSON.parse(raw) as DemoState;
        return memoryState;
      }
    } catch {
      // corrupt storage, fall through to fresh state
    }
  }
  memoryState = freshState();
  persist();
  return memoryState;
}

function persist() {
  if (!memoryState) return;
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    } catch {
      // storage full or unavailable — keep running in-memory only
    }
  }
}

function uid(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${rand}`;
}

function matchesFilter(c: Company, filter?: CompanyFilter): boolean {
  if (!filter) return true;
  if (filter.city && c.city?.toLowerCase() !== filter.city.toLowerCase()) return false;
  if (filter.industry && c.industry?.toLowerCase() !== filter.industry.toLowerCase()) return false;
  if (filter.websiteStatus && c.website_status !== filter.websiteStatus) return false;
  if (filter.pipelineStage && c.pipeline_stage !== filter.pipelineStage) return false;
  if (filter.type && c.type !== filter.type) return false;
  if (filter.search) {
    const needle = filter.search.toLowerCase();
    const haystack = `${c.name} ${c.city ?? ""} ${c.industry ?? ""}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export function createDemoProvider(): DataProvider {
  return {
    mode: "demo",

    async listCompanies(filter) {
      const state = loadState();
      return state.companies.filter((c) => matchesFilter(c, filter)).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    },
    async getCompany(id) {
      const state = loadState();
      return state.companies.find((c) => c.id === id) ?? null;
    },
    async createCompany(input) {
      const state = loadState();
      const nowIso = new Date().toISOString();
      const company: Company = {
        id: uid("c"),
        type: input.type ?? "lead",
        name: input.name,
        city: input.city ?? null,
        industry: input.industry ?? null,
        website_url: input.website_url ?? null,
        website_status: input.website_status ?? "onbekend",
        phone: input.phone ?? null,
        email: input.email ?? null,
        kvk_number: input.kvk_number ?? null,
        kvk_verified: input.kvk_verified ?? false,
        opportunity_score: input.opportunity_score ?? null,
        pipeline_stage: input.pipeline_stage ?? "nieuw",
        source: input.source ?? "Handmatig toegevoegd",
        research_sources: input.research_sources ?? [],
        website_recommendation: input.website_recommendation ?? null,
        notes: input.notes ?? null,
        last_verified_at: input.last_verified_at ?? null,
        is_demo: false,
        created_at: nowIso,
        updated_at: nowIso,
      };
      state.companies.push(company);
      persist();
      return company;
    },
    async updateCompany(id, patch) {
      const state = loadState();
      const idx = state.companies.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Bedrijf niet gevonden");
      state.companies[idx] = { ...state.companies[idx], ...patch, updated_at: new Date().toISOString() };
      persist();
      return state.companies[idx];
    },

    async listContacts(companyId) {
      const state = loadState();
      return state.contacts.filter((c) => c.company_id === companyId);
    },
    async createContact(input) {
      const state = loadState();
      const contact: Contact = {
        id: uid("ct"),
        company_id: input.company_id,
        name: input.name,
        role_title: input.role_title ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        is_primary: input.is_primary ?? false,
        created_at: new Date().toISOString(),
      };
      state.contacts.push(contact);
      persist();
      return contact;
    },

    async listInteractions(companyId) {
      const state = loadState();
      return state.interactions
        .filter((i) => i.company_id === companyId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async addInteraction(input) {
      const state = loadState();
      const interaction: Interaction = {
        id: uid("i"),
        company_id: input.company_id,
        kind: input.kind,
        content: input.content,
        created_by: input.created_by ?? "Jij",
        agent_run_id: input.agent_run_id ?? null,
        created_at: new Date().toISOString(),
      };
      state.interactions.push(interaction);
      const company = state.companies.find((c) => c.id === input.company_id);
      if (company) company.updated_at = interaction.created_at;
      persist();
      return interaction;
    },

    async listProjects() {
      return loadState().projects.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    },
    async createProject(input) {
      const state = loadState();
      const nowIso = new Date().toISOString();
      const project: Project = {
        id: uid("p"),
        company_id: input.company_id ?? null,
        name: input.name,
        project_type: input.project_type ?? "website",
        status: input.status ?? "intake",
        budget: input.budget ?? null,
        start_date: input.start_date ?? null,
        deadline: input.deadline ?? null,
        notes: input.notes ?? null,
        created_at: nowIso,
        updated_at: nowIso,
      };
      state.projects.push(project);
      persist();
      return project;
    },
    async updateProject(id, patch) {
      const state = loadState();
      const idx = state.projects.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Project niet gevonden");
      state.projects[idx] = { ...state.projects[idx], ...patch, updated_at: new Date().toISOString() };
      persist();
      return state.projects[idx];
    },

    async listTasks() {
      return loadState().tasks.slice().sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
    },
    async createTask(input) {
      const state = loadState();
      const nowIso = new Date().toISOString();
      const task: Task = {
        id: uid("t"),
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "open",
        priority: input.priority ?? "normaal",
        due_date: input.due_date ?? null,
        related_company_id: input.related_company_id ?? null,
        related_project_id: input.related_project_id ?? null,
        created_at: nowIso,
        updated_at: nowIso,
      };
      state.tasks.push(task);
      persist();
      return task;
    },
    async updateTask(id, patch) {
      const state = loadState();
      const idx = state.tasks.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Taak niet gevonden");
      state.tasks[idx] = { ...state.tasks[idx], ...patch, updated_at: new Date().toISOString() };
      persist();
      return state.tasks[idx];
    },

    async listAppointments() {
      return loadState().appointments.slice().sort((a, b) => a.start_at.localeCompare(b.start_at));
    },
    async createAppointment(input) {
      const state = loadState();
      const appointment: Appointment = {
        id: uid("a"),
        title: input.title,
        description: input.description ?? null,
        start_at: input.start_at,
        end_at: input.end_at,
        location: input.location ?? null,
        related_company_id: input.related_company_id ?? null,
        created_at: new Date().toISOString(),
      };
      state.appointments.push(appointment);
      persist();
      return appointment;
    },

    async listQuotes() {
      return loadState().quotes.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async createQuote(input) {
      const state = loadState();
      const quote: Quote = {
        id: uid("q"),
        company_id: input.company_id ?? null,
        number: input.number,
        status: input.status ?? "concept",
        amount: input.amount,
        valid_until: input.valid_until ?? null,
        items: input.items ?? [],
        created_at: new Date().toISOString(),
      };
      state.quotes.push(quote);
      persist();
      return quote;
    },
    async updateQuote(id, patch) {
      const state = loadState();
      const idx = state.quotes.findIndex((q) => q.id === id);
      if (idx === -1) throw new Error("Offerte niet gevonden");
      state.quotes[idx] = { ...state.quotes[idx], ...patch };
      persist();
      return state.quotes[idx];
    },

    async listInvoices() {
      return loadState().invoices.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async createInvoice(input) {
      const state = loadState();
      const invoice: Invoice = {
        id: uid("inv"),
        company_id: input.company_id ?? null,
        quote_id: input.quote_id ?? null,
        number: input.number,
        status: input.status ?? "concept",
        amount: input.amount,
        due_date: input.due_date ?? null,
        paid_at: input.paid_at ?? null,
        created_at: new Date().toISOString(),
      };
      state.invoices.push(invoice);
      persist();
      return invoice;
    },
    async updateInvoice(id, patch) {
      const state = loadState();
      const idx = state.invoices.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error("Factuur niet gevonden");
      state.invoices[idx] = { ...state.invoices[idx], ...patch };
      persist();
      return state.invoices[idx];
    },

    async listFinancialEntries() {
      return loadState().financialEntries.slice().sort((a, b) => b.entry_date.localeCompare(a.entry_date));
    },
    async createFinancialEntry(input) {
      const state = loadState();
      const entry: FinancialEntry = {
        id: uid("f"),
        entry_type: input.entry_type,
        category: input.category,
        description: input.description ?? null,
        amount: input.amount,
        entry_date: input.entry_date ?? new Date().toISOString().slice(0, 10),
        related_invoice_id: input.related_invoice_id ?? null,
        created_at: new Date().toISOString(),
      };
      state.financialEntries.push(entry);
      persist();
      return entry;
    },

    async listGoals() {
      return loadState().goals.slice();
    },
    async createGoal(input) {
      const state = loadState();
      const goal: BusinessGoal = {
        id: uid("g"),
        title: input.title,
        description: input.description ?? null,
        metric_target: input.metric_target ?? null,
        metric_current: input.metric_current ?? 0,
        unit: input.unit ?? null,
        deadline: input.deadline ?? null,
        status: input.status ?? "actief",
        created_at: new Date().toISOString(),
      };
      state.goals.push(goal);
      persist();
      return goal;
    },
    async updateGoal(id, patch) {
      const state = loadState();
      const idx = state.goals.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error("Doel niet gevonden");
      state.goals[idx] = { ...state.goals[idx], ...patch };
      persist();
      return state.goals[idx];
    },

    async listAgentRuns() {
      return loadState().agentRuns.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async createAgentRun(input) {
      const state = loadState();
      const run: AgentRun = {
        id: uid("ar"),
        agent_role: input.agent_role,
        action: input.action,
        permission_tier: input.permission_tier,
        input: input.input ?? {},
        output: input.output ?? null,
        status: input.status ?? (input.permission_tier === 1 ? "automatisch_uitgevoerd" : "wacht_op_goedkeuring"),
        related_company_id: input.related_company_id ?? null,
        error: input.error ?? null,
        created_at: new Date().toISOString(),
        decided_at: null,
        decided_by: null,
      };
      state.agentRuns.push(run);
      if (run.status === "wacht_op_goedkeuring") {
        state.approvals.push({
          id: uid("ap"),
          agent_run_id: run.id,
          summary: `${run.agent_role} wil "${run.action}" uitvoeren en wacht op goedkeuring.`,
          payload: run.input,
          status: "open",
          created_at: run.created_at,
          decided_at: null,
          decided_by: null,
        });
      }
      persist();
      return run;
    },

    async listApprovals() {
      return loadState().approvals.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async decideApproval(id, decision) {
      const state = loadState();
      const idx = state.approvals.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Goedkeuring niet gevonden");
      const nowIso = new Date().toISOString();
      state.approvals[idx] = { ...state.approvals[idx], status: decision, decided_at: nowIso };
      const runIdx = state.agentRuns.findIndex((r) => r.id === state.approvals[idx].agent_run_id);
      if (runIdx !== -1) {
        state.agentRuns[runIdx] = { ...state.agentRuns[runIdx], status: decision, decided_at: nowIso };
      }
      persist();
      return state.approvals[idx];
    },

    async resetDemoData() {
      memoryState = freshState();
      persist();
    },
  };
}
