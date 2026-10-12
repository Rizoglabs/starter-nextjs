import { ApiError, readJson, withApiSession } from "@/lib/api";
import {
  deleteAttachment,
  updateAttachment,
} from "@/services/attachments.service";
import {
  attachmentIdSchema,
  updateAttachmentSchema,
} from "@/validators/attachments";
import { siteIdSchema } from "@/validators/sites";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; attachmentId: string }> };

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id, attachmentId } = await params;
    const input = updateAttachmentSchema.parse(await readJson(request));
    const row = await updateAttachment(
      session.user.id,
      siteIdSchema.parse(id),
      attachmentIdSchema.parse(attachmentId),
      input,
    );
    if (!row) throw new ApiError(404, "NOT_FOUND", "Arsip tidak ditemukan.");
    return Response.json({ data: row });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id, attachmentId } = await params;
    const deleted = await deleteAttachment(
      session.user.id,
      siteIdSchema.parse(id),
      attachmentIdSchema.parse(attachmentId),
    );
    if (!deleted)
      throw new ApiError(404, "NOT_FOUND", "Arsip tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
