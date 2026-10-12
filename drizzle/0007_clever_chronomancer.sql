CREATE TABLE "pkbon_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tahun" integer NOT NULL,
	"seq" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pkbon_counters_user_tahun_uniq" UNIQUE("user_id","tahun")
);
--> statement-breakpoint
CREATE TABLE "pkbon_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nomor" varchar(80) NOT NULL,
	"nama" varchar(160) NOT NULL,
	"kota" varchar(120),
	"bank_nama" varchar(60),
	"bank_rekening" varchar(60),
	"tanggal" timestamp with time zone NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'diajukan' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pkbon_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"uraian" varchar(300) NOT NULL,
	"jumlah" integer NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pkbon_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nama_default" varchar(160),
	"kota_default" varchar(120),
	"bank_nama" varchar(60),
	"bank_rekening" varchar(60),
	"bank_pemilik" varchar(160),
	"pejabat1_nama" varchar(160),
	"pejabat1_jabatan" varchar(160),
	"pejabat2_nama" varchar(160),
	"pejabat2_jabatan" varchar(160),
	"prefix_nomor" varchar(20) DEFAULT 'MINK',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pkbon_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "pkbon_counters" ADD CONSTRAINT "pkbon_counters_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pkbon_forms" ADD CONSTRAINT "pkbon_forms_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pkbon_items" ADD CONSTRAINT "pkbon_items_form_id_pkbon_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."pkbon_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pkbon_items" ADD CONSTRAINT "pkbon_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pkbon_settings" ADD CONSTRAINT "pkbon_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;