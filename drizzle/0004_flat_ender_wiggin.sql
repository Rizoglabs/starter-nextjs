CREATE TABLE "site_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"kategori" varchar(20) NOT NULL,
	"judul" varchar(200) NOT NULL,
	"drive_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_progress_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"progres" integer NOT NULL,
	"tanggal" timestamp with time zone NOT NULL,
	"catatan" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_attachments" ADD CONSTRAINT "site_attachments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_attachments" ADD CONSTRAINT "site_attachments_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_progress_log" ADD CONSTRAINT "site_progress_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_progress_log" ADD CONSTRAINT "site_progress_log_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "site_attachments_site_idx" ON "site_attachments" USING btree ("site_id","kategori","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "site_progress_log_site_idx" ON "site_progress_log" USING btree ("site_id","tanggal" DESC NULLS LAST,"id" DESC NULLS LAST);