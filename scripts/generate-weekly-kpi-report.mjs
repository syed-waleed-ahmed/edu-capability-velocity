import fs from "node:fs/promises";
import path from "node:path";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function median(values) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function formatPercent(numerator, denominator) {
  if (denominator === 0) return "0.0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function toIsoDate(input) {
  return new Date(input).toISOString().slice(0, 10);
}

async function readTelemetryEvents(telemetryPath) {
  try {
    const raw = await fs.readFile(telemetryPath, "utf-8");

    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function buildAgentStats(events) {
  const map = new Map();

  for (const event of events) {
    const bucket = map.get(event.agentId) ?? {
      totalRuns: 0,
      successfulRuns: 0,
      schemaValidRuns: 0,
      durations: [],
    };

    bucket.totalRuns += 1;
    if (event.outcome === "success") {
      bucket.successfulRuns += 1;
    }
    if (event.schemaValid) {
      bucket.schemaValidRuns += 1;
    }
    bucket.durations.push(event.durationMs);

    map.set(event.agentId, bucket);
  }

  return [...map.entries()]
    .map(([agentId, stats]) => ({
      agentId,
      totalRuns: stats.totalRuns,
      successRate: formatPercent(stats.successfulRuns, stats.totalRuns),
      schemaValidRate: formatPercent(stats.schemaValidRuns, stats.totalRuns),
      medianLatencyMs: Math.round(median(stats.durations)),
    }))
    .sort((a, b) => b.totalRuns - a.totalRuns);
}

async function generateReport() {
  const telemetryPath = process.env.CAPABILITY_TELEMETRY_FILE
    ? path.resolve(process.env.CAPABILITY_TELEMETRY_FILE)
    : path.join(process.cwd(), "artifacts", "telemetry", "capability-events.ndjson");

  const reportPath = path.join(
    process.cwd(),
    "docs",
    "capability-velocity",
    "reports",
    "weekly-kpi-report.md"
  );

  const now = Date.now();
  const periodStart = now - ONE_WEEK_MS;

  const allEvents = await readTelemetryEvents(telemetryPath);
  const weeklyEvents = allEvents.filter((event) => {
    if (!event || typeof event !== "object") {
      return false;
    }

    if (!event.timestamp || !event.agentId || !event.outcome) {
      return false;
    }

    const ts = new Date(event.timestamp).getTime();
    return Number.isFinite(ts) && ts >= periodStart && ts <= now;
  });

  const totalRuns = weeklyEvents.length;
  const successfulRuns = weeklyEvents.filter((event) => event.outcome === "success").length;
  const failedRuns = totalRuns - successfulRuns;
  const schemaValidRuns = weeklyEvents.filter((event) => event.schemaValid).length;
  const latencies = weeklyEvents.map((event) => Number(event.durationMs) || 0);

  const avgLatencyMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((sum, n) => sum + n, 0) / latencies.length)
      : 0;

  const medianLatencyMs = Math.round(median(latencies));

  const agentStats = buildAgentStats(weeklyEvents);

  const report = [
    "# Weekly Capability KPI Report",
    "",
    `- Generated at: ${new Date(now).toISOString()}`,
    `- Telemetry source: ${telemetryPath}`,
    `- Reporting window: ${toIsoDate(periodStart)} to ${toIsoDate(now)}`,
    "",
    "## Summary",
    "",
    `- Total capability runs: ${totalRuns}`,
    `- Successful runs: ${successfulRuns}`,
    `- Failed runs: ${failedRuns}`,
    `- Success rate: ${formatPercent(successfulRuns, totalRuns)}`,
    `- Schema-valid output rate: ${formatPercent(schemaValidRuns, totalRuns)}`,
    `- Average latency: ${avgLatencyMs} ms`,
    `- Median latency: ${medianLatencyMs} ms`,
    "",
    "## Capability Velocity Baseline",
    "",
    `- Candidates evaluated this week (proxy: total runs): ${totalRuns}`,
    `- Candidates shipped this week (manual input required): TBD`,
    `- Reusable modules shipped this week (manual input required): TBD`,
    "",
    "## By Agent",
    "",
    "| Agent ID | Runs | Success Rate | Schema-Valid Rate | Median Latency (ms) |",
    "|---|---:|---:|---:|---:|",
    ...(agentStats.length
      ? agentStats.map(
          (row) =>
            `| ${row.agentId} | ${row.totalRuns} | ${row.successRate} | ${row.schemaValidRate} | ${row.medianLatencyMs} |`
        )
      : ["| (no data) | 0 | 0.0% | 0.0% | 0 |"]),
    "",
    "## Notes",
    "",
    "- This report is auto-generated from API telemetry hooks.",
    "- Manual product metrics can be appended for roadmap reviews.",
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, "utf-8");

  console.log(`Weekly KPI report written to ${reportPath}`);
}

generateReport().catch((error) => {
  console.error("Failed to generate KPI report:", error);
  process.exitCode = 1;
});
