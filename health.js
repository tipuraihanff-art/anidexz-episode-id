// api/health.js
// GET /api/health — simple liveness probe

export const config = { runtime: "edge" };

export default function handler() {
  return new Response(
    JSON.stringify({ status: "ok", ts: new Date().toISOString() }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
