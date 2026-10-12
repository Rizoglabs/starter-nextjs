import { ApiError, readJson, withApiSession } from "@/lib/api";
import {
  createAttachment,
  listAttachments,
} from "@/services/attachments.service";
import {
  createAttachmentSchema,
  listAttachmentsSchema,
  attachmentIdSchema as siteIdSchema,
} from "@/validators/attachments";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const siteId = siteIdSchema.parse(id);
    const query = listAttachmentsSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const result = await listAttachments(session.user.id, siteId, query);
    if (!result) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json(result);
  });
}

export function POST(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const siteId = siteIdSchema.parse(id);
    const input = createAttachmentSchema.parse(await readJson(request));
    const row = await createAttachment(session.user.id, siteId, input);
    if (!row) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json({ data: row }, { status: 201 });
  });
}
