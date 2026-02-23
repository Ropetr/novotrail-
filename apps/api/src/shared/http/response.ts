import type { Context } from "hono";
import type { HonoContext } from "../cloudflare/types";

export function ok<T>(
  c: Context<HonoContext>,
  data: T,
  status = 200,
  extra?: Record<string, unknown>
) {
  return c.json(
    {
      success: true,
      data,
      ...(extra || {}),
    },
    status as any
  );
}

export function fail(c: Context<HonoContext>, message: string, status = 400, details?: unknown) {
  return c.json(
    {
      success: false,
      error: message,
      details,
    },
    status as any
  );
}
