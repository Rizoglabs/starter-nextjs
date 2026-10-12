import { ApiError, readJson, withApiSession } from "@/lib/api";
import { createClient, listClients } from "@/services/clients.service";
import { createClientSchema } from "@/validators/clients";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    return Response.json({ data: await listClients(session.user.id) });
  });
}

export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const input = createClientSchema.parse(await readJson(request));
    const result = await createClient(session.user.id, input);
    if ("error" in result)
      throw new ApiError(409, "DUPLIKAT", "Client tersebut sudah ada.");
    return Response.json({ data: result.data }, { status: 201 });
  });
}
