import { ApiError, readJson, withApiSession } from "@/lib/api";
import { deleteSlaRule, updateSlaRule } from "@/services/sla_rules.service";
import { slaRuleIdSchema, updateSlaRuleSchema } from "@/validators/sla_rules";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const input = updateSlaRuleSchema.parse(await readJson(request));
    const row = await updateSlaRule(
      session.user.id,
      slaRuleIdSchema.parse(id),
      input,
    );
    if (!row) throw new ApiError(404, "NOT_FOUND", "Aturan tidak ditemukan.");
    return Response.json({ data: row });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const deleted = await deleteSlaRule(
      session.user.id,
      slaRuleIdSchema.parse(id),
    );
    if (!deleted)
      throw new ApiError(404, "NOT_FOUND", "Aturan tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
