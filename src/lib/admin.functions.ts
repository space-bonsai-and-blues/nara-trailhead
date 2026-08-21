import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ClaimFirstAdminInput = z.object({
  secret: z.string(),
});

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ClaimFirstAdminInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const expected = process.env["ADMIN_CLAIM_SECRET"];
    if (!expected) {
      console.error("ADMIN_CLAIM_SECRET is not configured");
      return { ok: false as const, reason: "not_configured" as const };
    }

    const { count: adminCount, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      console.error("claimFirstAdmin count error:", countError);
      return { ok: false as const, reason: "error" as const };
    }

    if (adminCount !== 0) {
      return { ok: false as const, reason: "already_claimed" as const };
    }

    if (data.secret !== expected) {
      return { ok: false as const, reason: "invalid_secret" as const };
    }

    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId,
      role: "admin",
    });

    if (error) {
      console.error("claimFirstAdmin insert error:", error);
      return { ok: false as const, reason: "error" as const };
    }

    return { ok: true as const };
  });


export const adminClaimed = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) {
    console.error("adminClaimed error:", error);
    throw new Error("Failed to check admin status");
  }

  return { claimed: (count ?? 0) > 0 };
});
