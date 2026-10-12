import { ApiError, withApiSession } from "@/lib/api";
import { deleteClient } from "@/services/clients.service";
import { clientIdSchema } from "@/validators/clients";

export const runtime = "nodejs";

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiSession(request, async (session) => {
    const { id } = await params;
    const deleted = await deleteClient(
      session.user.id,
      clientIdSchema.parse(id),
    );
    if (!deleted) throw new ApiError(404, "NOT_FOUND", "Client tidak ditemukan.");
    return new Response(null, { status: 204 });
  });
}
