import { ApiError, readJson, withApiSession } from "@/lib/api";
import {
  deletePkbonForm,
  getPkbonForm,
  updatePkbonStatus,
} from "@/services/pkbon.service";
import {
  pkbonFormIdSchema,
  updatePkbonStatusSchema,
} from "@/validators/pkbon";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const form = await getPkbonForm(
      session.user.id,
      pkbonFormIdSchema.parse(id),
    );
    if (!form) throw new ApiError(404, "NOT_FOUND", "Form tidak ditemukan.");
    return Response.json({ data: form });
  });
}

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const input = updatePkbonStatusSchema.parse(await readJson(request));
    const form = await updatePkbonStatus(
      session.user.id,
      pkbonFormIdSchema.parse(id),
      input.status,
    );
    if (!form) throw new ApiError(404, "NOT_FOUND", "Form tidak ditemukan.");
    return Response.json({ data: form });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const deleted = await deletePkbonForm(
      session.user.id,
      pkbonFormIdSchema.parse(id),
    );
    if (!deleted)
      throw new ApiError(404, "NOT_FOUND", "Form tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
