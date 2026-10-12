import { ApiError, readJson, withApiSession } from "@/lib/api";
import { addChecklistItem } from "@/services/bast.service";
import { bastIdSchema, createChecklistItemSchema } from "@/validators/bast";

export const runtime = "nodejs";

export function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const input = createChecklistItemSchema.parse(await readJson(request));
    const item = await addChecklistItem(
      session.user.id,
      bastIdSchema.parse(id),
      input.label,
    );
    if (!item) throw new ApiError(404, "NOT_FOUND", "BAST tidak ditemukan.");
    return Response.json({ data: item }, { status: 201 });
  });
}
