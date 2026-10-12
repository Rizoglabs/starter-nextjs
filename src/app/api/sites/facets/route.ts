import { withApiSession } from "@/lib/api";
import { getSiteFacets } from "@/services/sites.service";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    return Response.json({ data: await getSiteFacets(session.user.id) });
  });
}
