import { ApiError, readJson, withApiSession } from "@/lib/api";
import { deleteBast, getBast, updateBast } from "@/services/bast.service";
import { bastIdSchema, updateBastSchema } from "@/validators/bast";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const bast = await getBast(session.user.id, bastIdSchema.parse(id));
    if (!bast) throw new ApiError(404, "NOT_FOUND", "BAST tidak ditemukan.");
    return Response.json({ data: bast });
  });
}

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const input = updateBastSchema.parse(await readJson(request));
    const result = await updateBast(
      session.user.id,
      bastIdSchema.parse(id),
      input,
    );
    if (result.error === "TIDAK_ADA")
      throw new ApiError(404, "NOT_FOUND", "BAST tidak ditemukan.");
    if (result.error === "BELUM_TTD")
      throw new ApiError(
        422,
        "BELUM_TTD",
        "Kedua pihak harus sudah tanda tangan sebelum status Signed.",
      );
    return Response.json({ data: result.data });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const deleted = await deleteBast(
      session.user.id,
      bastIdSchema.parse(id),
    );
    if (!deleted)
      throw new ApiError(404, "NOT_FOUND", "BAST tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
