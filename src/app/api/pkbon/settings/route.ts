import { readJson, withApiSession } from "@/lib/api";
import { getPkbonSettings, upsertPkbonSettings } from "@/services/pkbon.service";
import { updatePkbonSettingsSchema } from "@/validators/pkbon";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    return Response.json({ data: await getPkbonSettings(session.user.id) });
  });
}

export function PUT(request: Request) {
  return withApiSession(request, async (session) => {
    const input = updatePkbonSettingsSchema.parse(await readJson(request));
    const data = await upsertPkbonSettings(session.user.id, input);
    return Response.json({ data });
  });
}
