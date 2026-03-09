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

function getTelemetryPath(): string {
  const configured = process.env.CAPABILITY_TELEMETRY_FILE;
  if (configured && configured.trim().length > 0) {
    return path.resolve(configured);
  }

  return DEFAULT_TELEMETRY_PATH;
}

export async function recordCapabilityRun(
  event: CapabilityRunTelemetryEvent
): Promise<void> {
  const payload = JSON.stringify(event);
  console.info(`[capability-telemetry] ${payload}`);

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
