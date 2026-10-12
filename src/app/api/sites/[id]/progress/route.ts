import { ApiError, readJson, withApiSession } from "@/lib/api";
import { listProgress, logProgress } from "@/services/progress.service";
import {
  listProgressSchema,
  logProgressSchema,
} from "@/validators/progress";
import { siteIdSchema } from "@/validators/sites";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const siteId = siteIdSchema.parse(id);
    const query = listProgressSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const result = await listProgress(session.user.id, siteId, query);
    if (!result) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json(result);
  });
}

export function POST(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const siteId = siteIdSchema.parse(id);
    const input = logProgressSchema.parse(await readJson(request));
    const row = await logProgress(session.user.id, siteId, input);
    if (!row) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json({ data: row }, { status: 201 });
  });
}
