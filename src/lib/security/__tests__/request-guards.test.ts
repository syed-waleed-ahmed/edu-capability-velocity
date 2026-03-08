import { afterEach, describe, expect, it } from "vitest";
import {
  enforceCommercialApiKey,
  enforceRateLimit,
  resetRateLimitStoreForTests,
  validateChatRequestBody,
} from "@/lib/security/request-guards";

const originalEnv = {
  COMMERCIAL_API_KEY: process.env.COMMERCIAL_API_KEY,
  API_RATE_LIMIT_MAX_REQUESTS: process.env.API_RATE_LIMIT_MAX_REQUESTS,
  API_RATE_LIMIT_WINDOW_MS: process.env.API_RATE_LIMIT_WINDOW_MS,
  API_MAX_MESSAGES_PER_REQUEST: process.env.API_MAX_MESSAGES_PER_REQUEST,
  API_MAX_TEXT_CHARS_PER_REQUEST: process.env.API_MAX_TEXT_CHARS_PER_REQUEST,
};

afterEach(() => {
  process.env.COMMERCIAL_API_KEY = originalEnv.COMMERCIAL_API_KEY;
  process.env.API_RATE_LIMIT_MAX_REQUESTS = originalEnv.API_RATE_LIMIT_MAX_REQUESTS;
  process.env.API_RATE_LIMIT_WINDOW_MS = originalEnv.API_RATE_LIMIT_WINDOW_MS;
  process.env.API_MAX_MESSAGES_PER_REQUEST = originalEnv.API_MAX_MESSAGES_PER_REQUEST;
  process.env.API_MAX_TEXT_CHARS_PER_REQUEST =
    originalEnv.API_MAX_TEXT_CHARS_PER_REQUEST;
  resetRateLimitStoreForTests();
});

describe("request guards", () => {
  it("accepts request when no commercial API key is configured", () => {
    delete process.env.COMMERCIAL_API_KEY;

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
    });

    const result = enforceCommercialApiKey(request);
    expect(result.ok).toBe(true);
  });

  it("rejects request with missing API key when commercial mode is enabled", () => {
    process.env.COMMERCIAL_API_KEY = "secret-key";

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
    });

    const result = enforceCommercialApiKey(request);
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.failure.status).toBe(401);
    }
  });

  it("limits burst requests by client IP", () => {
    process.env.API_RATE_LIMIT_MAX_REQUESTS = "2";
    process.env.API_RATE_LIMIT_WINDOW_MS = "60000";

    const first = new Request("http://localhost/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const second = new Request("http://localhost/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const third = new Request("http://localhost/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    expect(enforceRateLimit(first, 1_000).ok).toBe(true);
    expect(enforceRateLimit(second, 2_000).ok).toBe(true);

    const thirdResult = enforceRateLimit(third, 3_000);
    expect(thirdResult.ok).toBe(false);

    if (!thirdResult.ok) {
      expect(thirdResult.failure.status).toBe(429);
      expect(thirdResult.failure.headers?.["Retry-After"]).toBeDefined();
    }
  });

  it("validates and accepts a well-formed chat payload", () => {
    const payload = {
      agent: "content-converter-agent",
      messages: [
        {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "Create a quiz on biology" }],
        },
      ],
    };

    const result = validateChatRequestBody(payload);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.request.agentId).toBe("content-converter-agent");
      expect(result.request.messages).toHaveLength(1);
    }
  });

  it("rejects oversized payload text", () => {
    process.env.API_MAX_TEXT_CHARS_PER_REQUEST = "10";

    const payload = {
      agent: "content-converter-agent",
      messages: [
        {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "This is definitely too long" }],
        },
      ],
    };

    const result = validateChatRequestBody(payload);
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.failure.status).toBe(413);
    }
  });
});
