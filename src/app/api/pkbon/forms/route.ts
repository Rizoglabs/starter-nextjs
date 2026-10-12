import { readJson, withApiSession } from "@/lib/api";
import { createPkbonForm, listPkbonForms } from "@/services/pkbon.service";
import { createPkbonFormSchema, listPkbonFormsSchema } from "@/validators/pkbon";

export const runtime = "nodejs";

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const query = listPkbonFormsSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return Response.json(await listPkbonForms(session.user.id, query));
  });
}

export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const input = createPkbonFormSchema.parse(await readJson(request));
    const form = await createPkbonForm(session.user.id, input);
    return Response.json(
      { data: form },
      { status: 201, headers: { Location: `/api/pkbon/forms/${form.id}` } },
    );
  });
}
