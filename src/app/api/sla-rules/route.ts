import { ApiError, readJson, withApiSession } from "@/lib/api";
import { createSlaRule, listSlaRules } from "@/services/sla_rules.service";
import { createSlaRuleSchema } from "@/validators/sla_rules";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    return Response.json({ data: await listSlaRules(session.user.id) });
  });
}

export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const input = createSlaRuleSchema.parse(await readJson(request));
    const result = await createSlaRule(session.user.id, input);
    if ("error" in result)
      throw new ApiError(
        409,
        "DUPLIKAT",
        "Aturan untuk Regional x SOW tersebut sudah ada.",
      );
    return Response.json({ data: result.data }, { status: 201 });
  });
}
