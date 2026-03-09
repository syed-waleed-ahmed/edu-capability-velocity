import { timingSafeEqual } from "node:crypto";
import type { UIMessage } from "ai";

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 30;
const DEFAULT_MAX_MESSAGES = 40;
const DEFAULT_MAX_TEXT_CHARS = 40_000;
const DEFAULT_MESSAGE_CHAR_BUDGET = 8_000;

interface RateLimitEntry {
  count: number;
  resetAtMs: number;
}

interface UpstashConfig {
  restUrl: string;
  restToken: string;
}

type CommercialAuthMode = "strict" | "safe-browser";

interface JsonRecord {
  [key: string]: unknown;
}

export interface GuardFailure {
  status: number;
  error: string;
  headers?: Record<string, string>;
}

export interface ValidChatRequest {
  messages: UIMessage[];
  agentId: string;
}

export type GuardResult =
  | { ok: true }
  | {
      ok: false;
      failure: GuardFailure;
    };

export type BodyValidationResult =
  | {
      ok: true;
      request: ValidChatRequest;
    }
  | {
      ok: false;
      failure: GuardFailure;
    };

const rateLimitStore = new Map<string, RateLimitEntry>();

function getCommercialAuthMode(): CommercialAuthMode {
  const rawMode = process.env.COMMERCIAL_AUTH_MODE?.trim().toLowerCase();
  return rawMode === "safe-browser" ? "safe-browser" : "strict";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function asRecord(value: unknown): JsonRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function secureCompare(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function getRequestOrigin(request: Request): string | null {
  const explicitOrigin = request.headers.get("origin")?.trim();
  if (explicitOrigin) {
    return explicitOrigin.toLowerCase();
  }

  return null;
}

function getExpectedOrigin(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  const host = forwardedHost ?? request.headers.get("host")?.trim();

  if (!host) {
    return null;
  }

  const proto = request.headers.get("x-forwarded-proto")?.trim() ?? "https";
  return `${proto.toLowerCase()}://${host.toLowerCase()}`;
}

function isSafeBrowserRequest(request: Request): boolean {
  const origin = getRequestOrigin(request);
  const expectedOrigin = getExpectedOrigin(request);

  if (!origin || !expectedOrigin || origin !== expectedOrigin) {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  const fetchMode = request.headers.get("sec-fetch-mode")?.trim().toLowerCase();
  const userAgent = request.headers.get("user-agent")?.trim().toLowerCase();

  const acceptedFetchSite = ["same-origin", "same-site", "none"].includes(
    fetchSite ?? ""
  );
  const acceptedFetchMode =
    !fetchMode || ["cors", "same-origin", "navigate"].includes(fetchMode);
  const looksLikeBrowser = Boolean(userAgent && userAgent.includes("mozilla"));

  return acceptedFetchSite && acceptedFetchMode && looksLikeBrowser;
}

function collectTextPartsLength(message: JsonRecord): number {
  const parts = message.parts;

  if (!Array.isArray(parts)) {
    return 0;
  }

  return parts.reduce((total, part) => {
    const partRecord = asRecord(part);
    if (!partRecord || partRecord.type !== "text") {
      return total;
    }

    const text = asString(partRecord.text) ?? "";
    return total + text.length;
  }, 0);
}

function pruneRateLimitStore(nowMs: number): void {
  if (rateLimitStore.size < 2_000) {
    return;
  }

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAtMs <= nowMs) {
      rateLimitStore.delete(key);
    }
  }
}

function getUpstashConfig(): UpstashConfig | null {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!restUrl || !restToken) {
    return null;
  }

  return {
    restUrl: restUrl.replace(/\/$/, ""),
    restToken,
  };
}

function createRateLimitFailure(
  nowMs: number,
  resetAtMs: number,
  maxRequests: number
): GuardResult {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));

  return {
    ok: false,
    failure: {
      status: 429,
      error: "Rate limit exceeded",
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(resetAtMs / 1000)),
      },
    },
  };
}

function enforceInMemoryRateLimit(
  identifier: string,
  nowMs: number,
  maxRequests: number,
  windowMs: number
): GuardResult {
  const current = rateLimitStore.get(identifier);
  const active =
    current && current.resetAtMs > nowMs
      ? current
      : { count: 0, resetAtMs: nowMs + windowMs };

  active.count += 1;
  rateLimitStore.set(identifier, active);
  pruneRateLimitStore(nowMs);

  if (active.count <= maxRequests) {
    return { ok: true };
  }

  return createRateLimitFailure(nowMs, active.resetAtMs, maxRequests);
}

async function enforceDistributedRateLimit(
  identifier: string,
  nowMs: number,
  maxRequests: number,
  windowMs: number
): Promise<GuardResult | null> {
  const upstashConfig = getUpstashConfig();
  if (!upstashConfig) {
    return null;
  }

  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const resetAtMs = windowStartMs + windowMs;
  const key = `api:chat:rl:${identifier}:${windowStartMs}`;

  try {
    const response = await fetch(`${upstashConfig.restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashConfig.restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["INCR", key], ["PEXPIRE", key, windowMs]]),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as unknown;
    if (!Array.isArray(body) || body.length < 1) {
      return null;
    }

    const incrementResult = asRecord(body[0]);
    const count = Number.parseInt(String(incrementResult?.result ?? ""), 10);

    if (!Number.isFinite(count) || count < 1) {
      return null;
    }

    if (count <= maxRequests) {
      return { ok: true };
    }

    return createRateLimitFailure(nowMs, resetAtMs, maxRequests);
  } catch {
    return null;
  }
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const xRealIp = request.headers.get("x-real-ip")?.trim();
  if (xRealIp) return xRealIp;

  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  return "unknown";
}

export function enforceCommercialApiKey(request: Request): GuardResult {
  const configuredApiKey = process.env.COMMERCIAL_API_KEY?.trim();
  const authMode = getCommercialAuthMode();

  if (!configuredApiKey) {
    return { ok: true };
  }

  const headerApiKey = request.headers.get("x-api-key")?.trim();
  const authorization = request.headers.get("authorization")?.trim();
  const bearerToken = authorization?.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : undefined;

  const providedKey = headerApiKey ?? bearerToken;

  if (providedKey && secureCompare(configuredApiKey, providedKey)) {
    return { ok: true };
  }

  if (authMode === "safe-browser" && isSafeBrowserRequest(request)) {
    return { ok: true };
  }

  return {
    ok: false,
    failure: {
      status: 401,
      error: "Unauthorized",
      headers: {
        "WWW-Authenticate": 'Bearer realm="edu-capability-velocity"',
      },
    },
  };
}

export async function enforceRateLimit(
  request: Request,
  nowMs: number = Date.now()
): Promise<GuardResult> {
  const maxRequests = parsePositiveInt(
    process.env.API_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_RATE_LIMIT_MAX_REQUESTS
  );
  const windowMs = parsePositiveInt(
    process.env.API_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS
  );

  const identifier = getClientIp(request);

  const distributedResult = await enforceDistributedRateLimit(
    identifier,
    nowMs,
    maxRequests,
    windowMs
  );
  if (distributedResult) {
    return distributedResult;
  }

  return enforceInMemoryRateLimit(identifier, nowMs, maxRequests, windowMs);
}

export function validateChatRequestBody(body: unknown): BodyValidationResult {
  const payload = asRecord(body);

  if (!payload) {
    return {
      ok: false,
      failure: {
        status: 400,
        error: "Invalid JSON body",
      },
    };
  }

  const rawMessages = payload.messages;
  if (!Array.isArray(rawMessages)) {
    return {
      ok: false,
      failure: {
        status: 400,
        error: "messages must be an array",
      },
    };
  }

  const maxMessages = parsePositiveInt(
    process.env.API_MAX_MESSAGES_PER_REQUEST,
    DEFAULT_MAX_MESSAGES
  );

  if (rawMessages.length === 0) {
    return {
      ok: false,
      failure: {
        status: 400,
        error: "At least one message is required",
      },
    };
  }

  if (rawMessages.length > maxMessages) {
    return {
      ok: false,
      failure: {
        status: 413,
        error: `Too many messages in one request (max ${maxMessages})`,
      },
    };
  }

  const maxTextChars = parsePositiveInt(
    process.env.API_MAX_TEXT_CHARS_PER_REQUEST,
    DEFAULT_MAX_TEXT_CHARS
  );
  const maxTextCharsPerMessage = parsePositiveInt(
    process.env.API_MAX_TEXT_CHARS_PER_MESSAGE,
    DEFAULT_MESSAGE_CHAR_BUDGET
  );
  let totalTextChars = 0;

  for (let index = 0; index < rawMessages.length; index += 1) {
    const message = asRecord(rawMessages[index]);
    if (!message) {
      return {
        ok: false,
        failure: {
          status: 400,
          error: `Message at index ${index} must be an object`,
        },
      };
    }

    const role = asString(message.role);
    if (!role || !["user", "assistant", "system", "tool"].includes(role)) {
      return {
        ok: false,
        failure: {
          status: 400,
          error: `Message at index ${index} has invalid role`,
        },
      };
    }

    const chars = collectTextPartsLength(message);
    if (chars > maxTextCharsPerMessage) {
      return {
        ok: false,
        failure: {
          status: 413,
          error: `Message at index ${index} exceeds ${maxTextCharsPerMessage} characters`,
        },
      };
    }

    totalTextChars += chars;
  }

  if (totalTextChars > maxTextChars) {
    return {
      ok: false,
      failure: {
        status: 413,
        error: `Request text exceeds ${maxTextChars} characters`,
      },
    };
  }

  const rawAgentId = asString(payload.agent);
  const agentId = rawAgentId ?? "content-converter-agent";

  if (!/^[a-z0-9-]{3,64}$/.test(agentId)) {
    return {
      ok: false,
      failure: {
        status: 400,
        error: "Invalid agent id format",
      },
    };
  }

  return {
    ok: true,
    request: {
      messages: rawMessages as UIMessage[],
      agentId,
    },
  };
}

export function createErrorResponse(failure: GuardFailure): Response {
  return new Response(JSON.stringify({ error: failure.error }), {
    status: failure.status,
    headers: {
      "Content-Type": "application/json",
      ...(failure.headers ?? {}),
    },
  });
}

export function resetRateLimitStoreForTests(): void {
  rateLimitStore.clear();
}
