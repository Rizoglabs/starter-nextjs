import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
const handlers = toNextJsHandler(auth);

// FR-002: registrasi publik dinonaktifkan. Aplikasi ini single-user;
// akun hanya dibuat admin lewat jalur privat (admin plugin / role:set).
function blockPublicSignUp(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/auth/sign-up")) {
    return Response.json(
      { error: "Pendaftaran publik dinonaktifkan." },
      { status: 403 },
    );
  }
  return null;
}

export function GET(request: Request) {
  return blockPublicSignUp(request) ?? handlers.GET(request);
}

export function POST(request: Request) {
  return blockPublicSignUp(request) ?? handlers.POST(request);
}
