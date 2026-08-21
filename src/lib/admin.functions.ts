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
      throw new Error("Forbidden");
    }

    const { count: adminCount, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      console.error("claimFirstAdmin count error:", countError);
      throw new Error("Forbidden");
    }

    if (adminCount !== 0 || data.secret !== expected) {
      throw new Error("Forbidden");
    }

    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId,
      role: "admin",
    });

    if (error) {
      console.error("claimFirstAdmin insert error:", error);
      throw new Error("Forbidden");
    }

    return { ok: true };
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
