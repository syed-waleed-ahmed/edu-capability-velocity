import { mastra } from "@/mastra";
import { parseStructuredOutputFromText } from "@/lib/structured-output-parser";
import { recordCapabilityRun } from "@/lib/telemetry/capability-telemetry";
import {
  createErrorResponse,
  enforceCommercialApiKey,
  enforceRateLimit,
  validateChatRequestBody,
} from "@/lib/security/request-guards";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

export const runtime = "nodejs";

const KNOWN_AGENT_IDS = [
  "content-converter-agent",
  "study-package-agent",
  "drive-study-package-agent",
] as const;

type KnownAgentId = (typeof KNOWN_AGENT_IDS)[number];

function isKnownAgentId(value: string): value is KnownAgentId {
  return KNOWN_AGENT_IDS.includes(value as KnownAgentId);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  try {
    const authResult = enforceCommercialApiKey(req);
    if (!authResult.ok) {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId: "unknown",
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: `request-blocked:${authResult.failure.error}`,
      });
      return createErrorResponse(authResult.failure);
    }

    const rateLimitResult = await enforceRateLimit(req);
    if (!rateLimitResult.ok) {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId: "unknown",
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: `request-blocked:${rateLimitResult.failure.error}`,
      });
      return createErrorResponse(rateLimitResult.failure);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId: "unknown",
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: "request-invalid:invalid-json",
      });

      return createErrorResponse({
        status: 400,
        error: "Invalid JSON body",
      });
    }

    const validatedBody = validateChatRequestBody(body);
    if (!validatedBody.ok) {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId: "unknown",
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: `request-invalid:${validatedBody.failure.error}`,
      });
      return createErrorResponse(validatedBody.failure);
    }

    const { messages, agentId } = validatedBody.request;

    if (!isKnownAgentId(agentId)) {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId,
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: `Agent "${agentId}" not found`,
      });

      return new Response(JSON.stringify({ error: `Agent "${agentId}" not found` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const selectedAgentId: KnownAgentId = agentId;
    const agent = mastra.getAgent(selectedAgentId);

    if (!agent) {
      await recordCapabilityRun({
        timestamp: new Date().toISOString(),
        requestId,
        agentId: selectedAgentId,
        outcome: "failure",
        durationMs: Date.now() - startedAt,
        structuredType: null,
        schemaValid: false,
        errorMessage: `Agent "${selectedAgentId}" not found`,
      });

      return new Response(
        JSON.stringify({ error: `Agent "${selectedAgentId}" not found` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert UI messages (parts-based) to model messages (content-based)
    const modelMessages = await convertToModelMessages(messages);

    // Create UIMessageStream that bridges Mastra's textStream to AI SDK v6 format
    const textPartId = crypto.randomUUID();

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        let accumulatedText = "";

        try {
          const streamInput = modelMessages as Parameters<typeof agent.stream>[0];
          const mastraResult = await agent.stream(streamInput);

          // Send text-start event
          writer.write({ type: "text-start", id: textPartId });

          // Stream text deltas
          for await (const delta of mastraResult.textStream) {
            accumulatedText += delta;
            writer.write({ type: "text-delta", id: textPartId, delta });
          }

          // Send text-end event
          writer.write({ type: "text-end", id: textPartId });

          const structured = parseStructuredOutputFromText(accumulatedText);

          await recordCapabilityRun({
            timestamp: new Date().toISOString(),
            requestId,
            agentId: selectedAgentId,
            outcome: "success",
            durationMs: Date.now() - startedAt,
            structuredType: structured?.type ?? null,
            schemaValid: Boolean(structured),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown stream error";

          await recordCapabilityRun({
            timestamp: new Date().toISOString(),
            requestId,
            agentId: selectedAgentId,
            outcome: "failure",
            durationMs: Date.now() - startedAt,
            structuredType: null,
            schemaValid: false,
            errorMessage,
          });

          throw error;
        }
      },
      onError: (error) => {
        console.error("[API /chat] Stream error:", error);
        return error instanceof Error ? error.message : "Stream error";
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[API /chat] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    await recordCapabilityRun({
      timestamp: new Date().toISOString(),
      requestId,
      agentId: "unknown",
      outcome: "failure",
      durationMs: Date.now() - startedAt,
      structuredType: null,
      schemaValid: false,
      errorMessage: message,
    });

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
