CREATE TABLE "basts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"tipe" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"nomor_bast" varchar(160),
	"tanggal_bast" timestamp with time zone,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bast_checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bast_id" uuid NOT NULL,
	"label" varchar(200) NOT NULL,
	"selesai" boolean DEFAULT false NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bast_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bast_id" uuid NOT NULL,
	"pihak" varchar(10) NOT NULL,
	"nama" varchar(160),
	"jabatan" varchar(160),
	"sudah_ttd" boolean DEFAULT false NOT NULL,
	"tanggal_ttd" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "basts" ADD CONSTRAINT "basts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basts" ADD CONSTRAINT "basts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_checklist" ADD CONSTRAINT "bast_checklist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_checklist" ADD CONSTRAINT "bast_checklist_bast_id_basts_id_fk" FOREIGN KEY ("bast_id") REFERENCES "public"."basts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_signatures" ADD CONSTRAINT "bast_signatures_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bast_signatures" ADD CONSTRAINT "bast_signatures_bast_id_basts_id_fk" FOREIGN KEY ("bast_id") REFERENCES "public"."basts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "basts_user_site_idx" ON "basts" USING btree ("user_id","site_id");--> statement-breakpoint
CREATE INDEX "basts_user_status_idx" ON "basts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "bast_checklist_bast_idx" ON "bast_checklist" USING btree ("bast_id","urutan");--> statement-breakpoint
CREATE INDEX "bast_signatures_bast_idx" ON "bast_signatures" USING btree ("bast_id","pihak");