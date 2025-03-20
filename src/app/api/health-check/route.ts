// app/api/health-check/route.ts
export async function HEAD() {
  return new Response(null, { status: 200 });
}
