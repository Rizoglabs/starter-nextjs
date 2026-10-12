import { ApiError, readJson, withApiSession } from "@/lib/api";
import {
  deleteSite,
  getSite,
  updateSite,
} from "@/services/sites.service";
import { siteIdSchema, updateSiteSchema } from "@/validators/sites";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const site = await getSite(session.user.id, siteIdSchema.parse(id));
    if (!site) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json({ data: site });
  });
}

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const input = updateSiteSchema.parse(await readJson(request));
    const site = await updateSite(
      session.user.id,
      siteIdSchema.parse(id),
      input,
    );
    if (!site) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json({ data: site });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const deleted = await deleteSite(session.user.id, siteIdSchema.parse(id));
    if (!deleted) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
