import { readJson, withApiSession } from "@/lib/api";
import { createSite, listSites } from "@/services/sites.service";
import { createSiteSchema, listSitesSchema } from "@/validators/sites";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const query = listSitesSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return Response.json(await listSites(session.user.id, query));
  });
}

export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const input = createSiteSchema.parse(await readJson(request));
    const site = await createSite(session.user.id, input);
    return Response.json(
      { data: site },
      { status: 201, headers: { Location: `/api/sites/${site.id}` } },
    );
  });
}
