import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AGENTS } from "@/lib/ai/agents";
import { ANTHROPIC_MODEL, getAnthropicClient, isAdvisorConfigured } from "@/lib/ai/client";
import type { AgentRole } from "@/lib/types";

const requestSchema = z.object({
  role: z.enum([
    "ceo",
    "lead_research",
    "sales",
    "marketing",
    "finance",
    "project_manager",
    "web_expert",
    "quality_controller",
  ]),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) })).min(1).max(14),
  context: z.record(z.string(), z.unknown()).optional(),
});

// This route only ever *generates text*. It never sends communications,
// books meetings, issues quotes, touches a live site, or moves money — those
// side effects require a human decision in the Approval Center, enforced by
// the data layer, not by this endpoint or by the model's own instructions.
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Log eerst in." }, { status: 401 });
  }
  const sb = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: userData, error: authError } = await sb.auth.getUser(token);
  if (authError || !userData.user) return NextResponse.json({ error: "Sessie ongeldig." }, { status: 401 });
  const { data: owner } = await sb.from("profiles").select("id,role").eq("id", userData.user.id).eq("role", "owner").maybeSingle();
  if (!owner) return NextResponse.json({ error: "Geen eigenaarstoegang." }, { status: 403 });
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const { role, messages, context } = parsed.data;
  if (JSON.stringify(context || {}).length > 18000) return NextResponse.json({ error: "Te veel bedrijfscontext." }, { status: 413 });

  if (!isAdvisorConfigured() && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({
      connected: false,
      text:
        "De AI-adviseur is nog niet verbonden. Voeg een OPENROUTER_API_KEY of ANTHROPIC_API_KEY toe aan de omgevingsvariabelen van dit project om deze rol daadwerkelijk te activeren. Tot die tijd kan Oogstweb OS geen AI-tekst genereren — er wordt niets verzonnen of verzonnen gesimuleerd.",
    });
  }

  try {
    const agent = AGENTS[role as AgentRole];
    const systemPrompt = context
      ? `${agent.systemPrompt}\n\nContext (vastgelegde, bevestigde gegevens uit het systeem — verzin niets daarbuiten):\n${JSON.stringify(context, null, 2)}`
      : agent.systemPrompt;

    // Only the CEO can orchestrate. Explicit coordination requests use up to
    // three model calls (two specialists and one CEO synthesis).
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    // A question about capabilities is not a request to launch a team run.
    const capabilityQuestion = /(?:kan (?:je|jij|de ceo)|kun(?:nen|t) (?:de )?agent|hoe (?:werkt|kun)|stuur (?:je )?berichten)/i.test(lastUserMessage)
      && /(?:agent|team|samenwerk)/i.test(lastUserMessage);
    const coordinationRequested = /(?:samenwerk|schakel .*agent|laat .*agent|delegeer|verdeel .*taken|overleg met|maak samen|start .*team)/i.test(lastUserMessage);
    const hasTask = /(?:maak|analyseer|onderzoek|zoek|plan|bedenk|stel op|beoordeel|verbeter|bereken|controleer)/i.test(lastUserMessage);
    const coordinate = role === "ceo" && coordinationRequested && hasTask && !capabilityQuestion;

    async function generate(roleToRun: AgentRole, promptMessages: typeof messages, overrideSystem?: string): Promise<string> {
      const prompt = (overrideSystem || AGENTS[roleToRun].systemPrompt) + "\n\nBELANGRIJK: Maak onderscheid tussen uitgevoerd en voorgesteld werk. Er is geen internetbrowser, CRM-export, autonome uitvoering of berichtendienst. Meld nooit dat een lijst, e-mail, rapport, taak of follow-up is opgeslagen, verstuurd, ingepland of doorgestuurd tenzij dit expliciet blijkt uit de gegeven context. Geef bij ontbreken van geverifieerde prospects aan hoeveel er feitelijk bekend zijn. Geen fictieve bevestigingsvinkjes of deadlines. Antwoord compact, direct en concreet.";
      let answer = "";
      if (process.env.OPENROUTER_API_KEY) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [{ role: "system", content: prompt }, ...promptMessages],
            max_tokens: 950,
          }),
          signal: AbortSignal.timeout(25000),
        });
        if (!response.ok) throw new Error("OpenRouter antwoordde met HTTP " + response.status);
        const data = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
        answer = data.choices?.[0]?.message?.content?.trim() || "";
      } else {
        const client = getAnthropicClient();
        const response = await client.messages.create({
          model: ANTHROPIC_MODEL, max_tokens: 950, system: prompt,
          messages: promptMessages.map((m) => ({ role: m.role, content: m.content })),
        });
        answer = response.content.filter((block) => block.type === "text")
          .map((block) => ("text" in block ? block.text : "")).join("\n").trim();
      }
      if (!answer) throw new Error("De AI-agent gaf geen antwoord.");
      return answer;
    }

    let text: string;
    if (coordinate) {
      // Route by the actual business task, never to arbitrary defaults.
      const salesTask = /(?:lead|klant|acquisitie|verkoop|afspraak|prospect|bedrijven vinden|nieuwe klanten)/i.test(lastUserMessage);
      const financialTask = /(?:geld|omzet|kosten|winst|factuur|cashflow|financ)/i.test(lastUserMessage);
      const websiteTask = /(?:website|webshop|ontwerp|seo|snelheid|audit)/i.test(lastUserMessage);
      const projectTask = /(?:project|deadline|planning|taak|oplever)/i.test(lastUserMessage);
      const specialists: AgentRole[] = salesTask ? ["lead_research", "sales"]
        : financialTask ? ["finance", "quality_controller"]
        : websiteTask ? ["web_expert", "quality_controller"]
        : projectTask ? ["project_manager", "quality_controller"]
        : ["marketing", "quality_controller"];
      const task = [{ role: "user" as const, content:
        "Dit is een interne analyseopdracht van de CEO-agent. Vraag: " + lastUserMessage +
        "\nGebruik uitsluitend de gegeven context; je hebt GEEN internettoegang of externe acties. " +
        "Geef maximaal 5 concrete, toepasbare zinnen. Geen sjablonen, denkbeeldige tools, statusvinkjes, verzonnen klanten, bronnen, cijfers, toezeggingen of deadlines. Als het een algemene vraag over samenwerking is, geef uitleg in plaats van een werkplan." }];
      const results: Array<{ role: AgentRole; answer: string }> = [];
      for (const specialist of specialists) {
        try {
          const answer = await generate(specialist, task, AGENTS[specialist].systemPrompt +
            (context ? "\nBeschikbare vastgelegde context:\n" + JSON.stringify(context).slice(0,7000) : ""));
          results.push({ role: specialist, answer });
        } catch {
          results.push({ role: specialist, answer: "Deze specialist kon geen antwoord geven." });
        }
      }
      const reports = results.map((r) => AGENTS[r.role].name + ":\n" + r.answer).join("\n\n");
      const synthesis = await generate("ceo", [{ role: "user", content:
        "Oorspronkelijke opdracht: " + lastUserMessage + "\n\nInterne agentrapporten:\n" + reports +
        "\n\nCombineer dit tot één realistisch actieplan. Zeg niet dat er bedrijven online zijn onderzocht of acties zijn uitgevoerd. " +
        "Benoem wat nog handmatig of via toekomstige koppelingen moet gebeuren. Gebruik geen fictieve systemen zoals Jira, Asana of Slack, geen deadlines tenzij door de gebruiker opgegeven, en geen toezegging dat agenten later zelfstandig iets zullen doen. Maximaal 6 concrete stappen. Presenteer alleen daadwerkelijk teruggekomen specialistresultaten als geleverd. Geef nooit aan dat er CRM-data is opgehaald of dat werk al klaarstaat zonder bevestigde data." }], systemPrompt);
      text = "AI-team analyse (twee interne AI-antwoorden en CEO-samenvatting; geen externe acties uitgevoerd)\n\n" +
        results.map((r) => "**" + AGENTS[r.role].name + "**\n" + r.answer).join("\n\n") +
        "\n\n**CEO – gezamenlijk actieplan**\n" + synthesis;
    } else {
      text = await generate(role as AgentRole, messages, systemPrompt);
    }

    return NextResponse.json({ connected: true, text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout bij het aanroepen van de AI-adviseur.";
    return NextResponse.json({ connected: true, error: message }, { status: 502 });
  }
}
