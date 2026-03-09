export async function GET() {
  return Response.json({
    status: "ok",
    service: "edu-capability-velocity",
    timestamp: new Date().toISOString(),
    checks: {
      api: "up",
    },
  });
}
