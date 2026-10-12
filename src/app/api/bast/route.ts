import { ApiError, readJson, withApiSession } from "@/lib/api";
import { createBast, listBasts } from "@/services/bast.service";
import { createBastSchema, listBastsSchema } from "@/validators/bast";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const query = listBastsSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return Response.json(await listBasts(session.user.id, query));
  });
}

export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const input = createBastSchema.parse(await readJson(request));
    const bast = await createBast(session.user.id, input);
    if (!bast) throw new ApiError(404, "NOT_FOUND", "Site tidak ditemukan.");
    return Response.json(
      { data: bast },
      { status: 201, headers: { Location: `/api/bast/${bast.id}` } },
    );
  });
}
