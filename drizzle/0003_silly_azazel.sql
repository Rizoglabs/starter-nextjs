CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nama_site" varchar(200) NOT NULL,
	"project_id" varchar(100) NOT NULL,
	"site_id" varchar(100),
	"site_id_client" varchar(100),
	"task_id" varchar(100),
	"client" varchar(120),
	"tenant" varchar(120),
	"regional" varchar(120),
	"provinsi" varchar(120),
	"alamat" text,
	"koordinat" varchar(100),
	"pic" varchar(160),
	"pic_kontak" varchar(160),
	"sow" varchar(80),
	"tinggi_tower" varchar(40),
	"kontrak_pks" varchar(160),
	"no_spmk" varchar(160),
	"tanggal_spmk" timestamp with time zone,
	"tanggal_target" timestamp with time zone,
	"tanggal_mulai_rfi" timestamp with time zone,
	"timeline" text,
	"tanggal_selesai" timestamp with time zone,
	"target_bast" timestamp with time zone,
	"status_project" varchar(40) DEFAULT 'persiapan' NOT NULL,
	"progres" integer DEFAULT 0 NOT NULL,
	"tanggal_progres" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sites_user_created_id_idx" ON "sites" USING btree ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sites_user_status_idx" ON "sites" USING btree ("user_id","status_project");