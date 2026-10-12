import { redirect } from "next/navigation";

export const runtime = "nodejs";

// Halaman placeholder template; arahkan ke dashboard aplikasi.
export default function AppPage() {
  redirect("/dashboard");
}
