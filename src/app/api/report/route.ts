import { withApiSession } from "@/lib/api";
import { getReport } from "@/services/report.service";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    return Response.json({ data: await getReport(session.user.id) });
  });
}
