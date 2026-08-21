import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_CALLS = 60;

async function checkRateLimit(clientId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("rate_limits")
    .select("window_start, call_count")
    .eq("client_id", clientId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Rate limit fetch error:", fetchError);
    throw new Error("Rate limit check failed");
  }

  const count = existing?.call_count ?? 0;
  const windowStartTime = existing?.window_start ? new Date(existing.window_start).getTime() : 0;
  const now = Date.now();

  if (existing && now - windowStartTime < RATE_LIMIT_WINDOW_MS) {
    if (count >= RATE_LIMIT_MAX_CALLS) {
      throw new Error("Rate limit exceeded");
    }
    const { error: updateError } = await supabaseAdmin
      .from("rate_limits")
      .update({ call_count: count + 1 })
      .eq("client_id", clientId);
    if (updateError) {
      console.error("Rate limit update error:", updateError);
      throw new Error("Rate limit update failed");
    }
  } else {
    const { error: upsertError } = await supabaseAdmin.from("rate_limits").upsert(
      { client_id: clientId, window_start: new Date().toISOString(), call_count: 1 },
      { onConflict: "client_id" },
    );
    if (upsertError) {
      console.error("Rate limit upsert error:", upsertError);
      throw new Error("Rate limit upsert failed");
    }
  }
}

const StartSessionInput = z.object({
  clientId: z.string(),
  userAgent: z.string().optional(),
  appVersion: z.string().optional(),
});

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StartSessionInput.parse(input))
  .handler(async ({ data }) => {
    await checkRateLimit(data.clientId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("sessions")
      .insert({
        client_id: data.clientId,
        user_agent: data.userAgent ?? null,
        app_version: data.appVersion ?? null,
      })
      .select("id, access_token")
      .single();

    if (error || !row) {
      console.error("startSession error:", error);
      throw new Error("Failed to start session");
    }

    return { sessionId: row.id, accessToken: row.access_token };
  });

const LogEventInput = z.object({
  sessionId: z.string().uuid(),
  accessToken: z.string().uuid(),
  clientId: z.string(),
  event: z.object({
    type: z.string(),
    screen: z.string().optional(),
    payload: z.record(z.unknown()).optional(),
  }),
  patch: z.record(z.unknown()).optional(),
});

export const logEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LogEventInput.parse(input))
  .handler(async ({ data }) => {
    await checkRateLimit(data.clientId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: verifyError } = await supabaseAdmin
      .from("sessions")
      .select("id, transcript, events")
      .eq("id", data.sessionId)
      .eq("access_token", data.accessToken)
      .single();

    if (verifyError || !row) {
      throw new Error("Invalid session or access token");
    }

    const ts = new Date().toISOString();
    const transcriptEntry = { ts, ...data.event };
    const eventEntry = { ts, type: data.event.type };

    type SessionUpdate = {
      updated_at: string;
      transcript: unknown[];
      events: unknown[];
      [key: string]: unknown;
    };

    const update: SessionUpdate = {
      updated_at: ts,
      transcript: [...(row.transcript as unknown[]), transcriptEntry],
      events: [...(row.events as unknown[]), eventEntry],
    };

    if (data.patch && typeof data.patch === "object") {
      for (const [key, value] of Object.entries(data.patch)) {
        if (value !== undefined) {
          update[key] = value;
        }
      }
    }

    const { error } = await supabaseAdmin.from("sessions").update(update).eq("id", row.id);

    if (error) {
      console.error("logEvent error:", error);
      throw new Error("Failed to log event");
    }

    return { ok: true };
  });

const FinalizeSessionInput = z.object({
  sessionId: z.string().uuid(),
  accessToken: z.string().uuid(),
  clientId: z.string(),
  completed: z.boolean().optional(),
  abandonedAt: z.string().optional(),
  reflection: z.string().optional(),
  patch: z.record(z.unknown()).optional(),
});

export const finalizeSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FinalizeSessionInput.parse(input))
  .handler(async ({ data }) => {
    await checkRateLimit(data.clientId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: verifyError } = await supabaseAdmin
      .from("sessions")
      .select("id")
      .eq("id", data.sessionId)
      .eq("access_token", data.accessToken)
      .single();

    if (verifyError || !row) {
      throw new Error("Invalid session or access token");
    }

    type SessionUpdate = {
      updated_at: string;
      completed: boolean;
      [key: string]: unknown;
    };

    const update: SessionUpdate = {
      updated_at: new Date().toISOString(),
      completed: data.completed ?? true,
    };

    if (data.abandonedAt !== undefined) update["abandoned_at"] = data.abandonedAt;
    if (data.reflection !== undefined) update["reflection"] = data.reflection;

    if (data.patch && typeof data.patch === "object") {
      for (const [key, value] of Object.entries(data.patch)) {
        if (value !== undefined) {
          update[key] = value;
        }
      }
    }

    const { error } = await supabaseAdmin.from("sessions").update(update).eq("id", row.id);

    if (error) {
      console.error("finalizeSession error:", error);
      throw new Error("Failed to finalize session");
    }

    return { ok: true };
  });

const ForgetMeInput = z.object({
  clientId: z.string(),
});

export const forgetMe = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ForgetMeInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("sessions").delete().eq("client_id", data.clientId);

    if (error) {
      console.error("forgetMe error:", error);
      // Still return success — don't leak whether rows existed.
    }

    return { ok: true };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      throw new Error("Forbidden");
    }

    const { data: rows, error } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("listSessions error:", error);
      throw new Error("Failed to list sessions");
    }

    return { sessions: rows ?? [] };
  });
