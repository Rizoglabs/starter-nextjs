import { ApiError, readJson, withApiSession } from "@/lib/api";
import { updateSignature } from "@/services/bast.service";
import {
  bastIdSchema,
  signaturePihakSchema,
  updateSignatureSchema,
} from "@/validators/bast";

export const runtime = "nodejs";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; pihak: string }> },
) {
  return withApiSession(request, async (session) => {
    const { id, pihak } = await params;
    const input = updateSignatureSchema.parse(await readJson(request));
    const row = await updateSignature(
      session.user.id,
      bastIdSchema.parse(id),
      signaturePihakSchema.parse(pihak),
      input,
    );
    if (!row) throw new ApiError(404, "NOT_FOUND", "BAST tidak ditemukan.");
    return Response.json({ data: row });
  });
}
