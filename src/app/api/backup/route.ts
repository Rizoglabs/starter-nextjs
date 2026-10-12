import { withApiSession } from "@/lib/api";
import { exportBackup } from "@/services/backup.service";

export const runtime = "nodejs";

// F-017: unduh seluruh data sebagai satu file JSON.
export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const backup = await exportBackup(session.user.id);
    const tanggal = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="trackers-backup-${tanggal}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  });
}
