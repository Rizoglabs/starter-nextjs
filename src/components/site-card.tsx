import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const statusLabels: Record<string, string> = {
  persiapan: "Persiapan",
  berjalan: "Berjalan",
  selesai: "Selesai",
  tertunda: "Tertunda",
};

type SiteSummary = {
  id: string;
  namaSite: string;
  projectId: string;
  regional: string | null;
  sow: string | null;
  statusProject: string;
  progres: number;
  alamat: string | null;
};

export function SiteCard({ site }: { site: SiteSummary }) {
  return (
    <Link
      href={`/sites/${site.id}`}
      className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-7">{site.namaSite}</CardTitle>
            <Badge variant={site.statusProject === "selesai" ? "default" : "secondary"}>
              {statusLabels[site.statusProject] ?? site.statusProject}
            </Badge>
          </div>
          <CardDescription>
            {site.projectId}
            {site.sow ? ` · ${site.sow}` : ""}
            {site.regional ? ` · ${site.regional}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progres</span>
            <span className="font-medium">{site.progres}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={site.progres}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progres ${site.namaSite}`}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${site.progres}%` }}
            />
          </div>
          {site.alamat && (
            <p className="mt-3 truncate text-sm text-muted-foreground">
              {site.alamat}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
