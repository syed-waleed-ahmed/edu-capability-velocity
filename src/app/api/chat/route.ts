import { mastra } from "@/mastra";
import { createUIMessageStreamResponse, UIMessageStreamWriter } from "ai";

export async function POST(req: Request) {
  const { messages, agent: agentId } = await req.json();

  const selectedAgentId = agentId || "content-converter-agent";
  const agent = mastra.getAgent(selectedAgentId);

  if (!agent) {
    return new Response(
      JSON.stringify({ error: `Agent "${selectedAgentId}" not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = await agent.stream(messages);

  return result.toDataStreamResponse();
}
