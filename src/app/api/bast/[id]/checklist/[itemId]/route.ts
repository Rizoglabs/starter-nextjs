import { ApiError, readJson, withApiSession } from "@/lib/api";
import {
  deleteChecklistItem,
  toggleChecklistItem,
} from "@/services/bast.service";
import {
  bastIdSchema,
  checklistItemIdSchema,
  toggleChecklistSchema,
} from "@/validators/bast";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; itemId: string }> };

export function PATCH(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id, itemId } = await params;
    const input = toggleChecklistSchema.parse(await readJson(request));
    const item = await toggleChecklistItem(
      session.user.id,
      bastIdSchema.parse(id),
      checklistItemIdSchema.parse(itemId),
      input.selesai,
    );
    if (!item)
      throw new ApiError(404, "NOT_FOUND", "Item checklist tidak ditemukan.");
    return Response.json({ data: item });
  });
}

export function DELETE(request: Request, { params }: Params) {
  return withApiSession(request, async (session) => {
    const { id, itemId } = await params;
    const deleted = await deleteChecklistItem(
      session.user.id,
      bastIdSchema.parse(id),
      checklistItemIdSchema.parse(itemId),
    );
    if (!deleted)
      throw new ApiError(404, "NOT_FOUND", "Item checklist tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
