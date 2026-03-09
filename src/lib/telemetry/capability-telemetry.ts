import * as fs from "fs/promises";
import * as path from "path";

export interface CapabilityRunTelemetryEvent {
  timestamp: string;
  requestId: string;
  agentId: string;
  outcome: "success" | "failure";
  durationMs: number;
  structuredType: string | null;
  schemaValid: boolean;
  errorMessage?: string;
}

const DEFAULT_TELEMETRY_PATH = path.join(
  process.cwd(),
  "artifacts",
  "telemetry",
  "capability-events.ndjson"
);

const DEFAULT_VERCEL_TELEMETRY_PATH = "/tmp/capability-events.ndjson";

interface TelemetryHttpConfig {
  endpoint: string;
  token?: string;
}

function getTelemetryHttpConfig(): TelemetryHttpConfig | null {
  const endpoint = process.env.CAPABILITY_TELEMETRY_HTTP_ENDPOINT?.trim();
  if (!endpoint) {
    return null;
  }

  return {
    endpoint,
    token: process.env.CAPABILITY_TELEMETRY_HTTP_TOKEN?.trim(),
  };
}

function getTelemetryPath(): string {
  const configured = process.env.CAPABILITY_TELEMETRY_FILE;
  if (configured && configured.trim().length > 0) {
    return path.resolve(configured);
  }

  if (process.env.VERCEL === "1") {
    return DEFAULT_VERCEL_TELEMETRY_PATH;
  }

  return DEFAULT_TELEMETRY_PATH;
}

async function persistToFile(payload: string): Promise<void> {
  const telemetryPath = getTelemetryPath();

  try {
    await fs.mkdir(path.dirname(telemetryPath), { recursive: true });
    await fs.appendFile(telemetryPath, `${payload}\n`, "utf-8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `[capability-telemetry] Failed to persist telemetry to ${telemetryPath}: ${reason}`
    );
  }
}

async function persistToHttpSink(payload: string): Promise<void> {
  const config = getTelemetryHttpConfig();
  if (!config) {
    return;
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: payload,
      cache: "no-store",
    });

    if (!response.ok) {
      const reason = await response.text();
      console.warn(
        `[capability-telemetry] HTTP sink rejected event (${response.status}): ${reason.slice(0, 300)}`
      );
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `[capability-telemetry] Failed to send telemetry to HTTP sink: ${reason}`
    );
  }
}

export async function recordCapabilityRun(
  event: CapabilityRunTelemetryEvent
): Promise<void> {
  const payload = JSON.stringify(event);
  console.info(`[capability-telemetry] ${payload}`);

  await Promise.allSettled([persistToFile(payload), persistToHttpSink(payload)]);
}
