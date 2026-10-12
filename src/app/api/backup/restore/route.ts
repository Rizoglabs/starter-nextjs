import { ApiError, withApiSession } from "@/lib/api";
import { importBackup } from "@/services/backup.service";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// F-017: pulihkan data dari file backup JSON (menimpa data saat ini).
export function POST(request: Request) {
  return withApiSession(request, async (session) => {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json"))
      throw new ApiError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Kirim file backup berformat JSON.",
      );
    const text = await request.text();
    if (text.length > MAX_BYTES)
      throw new ApiError(413, "TERLALU_BESAR", "File backup terlalu besar.");
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new ApiError(400, "INVALID_JSON", "File bukan JSON yang valid.");
    }
    const result = await importBackup(session.user.id, raw);
    if (!result.ok)
      throw new ApiError(422, "BACKUP_INVALID", result.error);
    return Response.json({ data: result.counts });
  });
}
