const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const PER_IP_DAILY = Number(process.env.PER_IP_DAILY_CAP ?? 40);

// Best-effort guard: per serverless instance, resets on cold start. Real cap is the provider's daily allocation.
const usage = new Map<string, { day: string; n: number }>();

function configured() {
  return Boolean(process.env.CF_ACCOUNT_ID && process.env.CF_API_TOKEN);
}

function err(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET() {
  return Response.json({ configured: configured(), model: "FLUX.1 schnell" });
}

export async function POST(req: Request) {
  if (!configured()) {
    return err(503, "not_configured", "Image generation isn't configured on this deployment.");
  }

  let body: { prompt?: unknown; seed?: unknown };
  try {
    body = await req.json();
  } catch {
    return err(400, "invalid_input", "Request body must be JSON.");
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 1000) {
    return err(400, "invalid_input", "Prompt must be 1–1000 characters.");
  }
  const seed = Number.isInteger(body.seed) ? (body.seed as number) : undefined;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(ip);
  const n = u?.day === day ? u.n : 0;
  if (n >= PER_IP_DAILY) {
    return err(429, "quota_exhausted", "Daily free capacity reached. Resets at 00:00 UTC.");
  }
  usage.set(ip, { day, n: n + 1 });

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, steps: 4, ...(seed !== undefined && { seed }) }),
        signal: AbortSignal.timeout(45_000),
      },
    );
  } catch {
    return err(504, "provider_unavailable", "The model didn't respond in time. Try again.");
  }

  const data = (await res.json().catch(() => null)) as
    | { success?: boolean; result?: { image?: string }; errors?: { message?: string }[] }
    | null;

  if (res.status === 429) return err(429, "quota_exhausted", "Free model capacity is used up for today.");
  if (!res.ok || !data?.result?.image) {
    const msg = data?.errors?.[0]?.message ?? "";
    if (res.status === 400 && /nsfw|safety|flagged/i.test(msg)) {
      return err(422, "provider_blocked", "The model declined this prompt. Try rephrasing it.");
    }
    return err(502, "provider_unavailable", "The model returned an error. Try again.");
  }

  return new Response(Buffer.from(data.result.image, "base64"), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
  });
}
