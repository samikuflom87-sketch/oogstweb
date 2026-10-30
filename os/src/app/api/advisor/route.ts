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
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
  context: z.record(z.string(), z.unknown()).optional(),
});

// This route only ever *generates text*. It never sends communications,
// books meetings, issues quotes, touches a live site, or moves money — those
// side effects require a human decision in the Approval Center, enforced by
// the data layer, not by this endpoint or by the model's own instructions.
export async function POST(req: NextRequest) {
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const { role, messages, context } = parsed.data;

  if (!isAdvisorConfigured()) {
    return NextResponse.json({
      connected: false,
      text:
        "De AI-adviseur is nog niet verbonden. Voeg een ANTHROPIC_API_KEY toe aan de omgevingsvariabelen van dit project om deze rol daadwerkelijk te activeren. Tot die tijd kan Oogstweb OS geen AI-tekst genereren — er wordt niets verzonnen of verzonnen gesimuleerd.",
    });
  }

  try {
    const client = getAnthropicClient();
    const agent = AGENTS[role as AgentRole];
    const systemPrompt = context
      ? `${agent.systemPrompt}\n\nContext (vastgelegde, bevestigde gegevens uit het systeem — verzin niets daarbuiten):\n${JSON.stringify(context, null, 2)}`
      : agent.systemPrompt;

    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ connected: true, text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout bij het aanroepen van de AI-adviseur.";
    return NextResponse.json({ connected: true, error: message }, { status: 502 });
  }
}
