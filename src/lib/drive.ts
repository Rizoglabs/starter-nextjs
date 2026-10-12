// Utilitas tautan Google Drive (ISS-L011).
// Aplikasi tidak memakai Drive API: file tetap di Drive,
// aplikasi hanya menyimpan tautan dan menampilkan preview.

const FILE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?[^#]*\bid=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/\w+\/d\/([a-zA-Z0-9_-]+)/,
];

export function isDriveUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "drive.google.com" || host.endsWith(".drive.google.com") || host === "docs.google.com";
  } catch {
    return false;
  }
}

export function extractDriveId(url: string): string | null {
  for (const pattern of FILE_ID_PATTERNS) {
    const match = pattern.exec(url);
    if (match) return match[1];
  }
  return null;
}

// URL embed untuk preview di iframe. Folder tidak punya preview file;
// kembalikan null agar UI menampilkan tautan biasa.
export function drivePreviewUrl(url: string): string | null {
  if (/drive\.google\.com\/drive\/folders\//.test(url)) return null;
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
