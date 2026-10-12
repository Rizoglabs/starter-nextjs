import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels } from "@/components/site-card";

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value: unknown }) {
  const text =
    value === null || value === undefined || value === ""
      ? "—"
      : String(value);
  return (
    <div className="grid grid-cols-3 gap-4 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{text}</dd>
    </div>
  );
}

type Site = {
  id: string;
  namaSite: string;
  projectId: string;
  siteId: string | null;
  siteIdClient: string | null;
  taskId: string | null;
  client: string | null;
  tenant: string | null;
  regional: string | null;
  provinsi: string | null;
  alamat: string | null;
  koordinat: string | null;
  pic: string | null;
  picKontak: string | null;
  sow: string | null;
  tinggiTower: string | null;
  kontrakPks: string | null;
  noSpmk: string | null;
  tanggalSpmk: string | Date | null;
  tanggalTarget: string | Date | null;
  tanggalMulaiRfi: string | Date | null;
  timeline: string | null;
  tanggalSelesai: string | Date | null;
  targetBast: string | Date | null;
  statusProject: string;
  progres: number;
  tanggalProgres: string | Date | null;
};

export function SiteDetail({ site }: { site: Site }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {site.namaSite}
          </h1>
          <Badge>{statusLabels[site.statusProject] ?? site.statusProject}</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          {site.projectId}
          {site.sow ? ` · ${site.sow}` : ""}
          {site.regional ? ` · ${site.regional}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identitas</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="Nama Site" value={site.namaSite} />
            <Row label="Project ID" value={site.projectId} />
            <Row label="Site ID" value={site.siteId} />
            <Row label="Site ID Client" value={site.siteIdClient} />
            <Row label="Task ID" value={site.taskId} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lokasi & Klien</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="Client" value={site.client} />
            <Row label="Tenant" value={site.tenant} />
            <Row label="Regional" value={site.regional} />
            <Row label="Provinsi" value={site.provinsi} />
            <Row label="Alamat" value={site.alamat} />
            <Row label="Koordinat" value={site.koordinat} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak & Teknis</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="PIC" value={site.pic} />
            <Row label="Kontak PIC" value={site.picKontak} />
            <Row label="SOW" value={site.sow} />
            <Row label="Tinggi Tower" value={site.tinggiTower} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontrak & Jadwal</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="Kontrak / PKS" value={site.kontrakPks} />
            <Row label="No. SPMK" value={site.noSpmk} />
            <Row label="Tanggal SPMK" value={formatDate(site.tanggalSpmk)} />
            <Row label="Tanggal Target" value={formatDate(site.tanggalTarget)} />
            <Row
              label="Tanggal Mulai / RFI"
              value={formatDate(site.tanggalMulaiRfi)}
            />
            <Row label="Timeline" value={site.timeline} />
            <Row
              label="Tanggal Selesai"
              value={formatDate(site.tanggalSelesai)}
            />
            <Row label="Target BAST" value={formatDate(site.targetBast)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Progres</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row
              label="Status Project"
              value={statusLabels[site.statusProject] ?? site.statusProject}
            />
            <Row label="Progres" value={`${site.progres}%`} />
            <Row
              label="Tanggal Progres"
              value={formatDate(site.tanggalProgres)}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
