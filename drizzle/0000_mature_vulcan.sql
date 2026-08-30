CREATE TYPE "public"."order_status" AS ENUM('cancelled', 'damaged', 'delivered', 'paid', 'pending', 'processing', 'refunded', 'removed', 'shipped');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'SALES_ASSOCIATE', 'USER');--> statement-breakpoint
CREATE TABLE "authentication_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"ip_address" text,
	"succeeded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "book_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" text NOT NULL,
	"label" text NOT NULL,
	"show" boolean DEFAULT true NOT NULL,
	"show_on_landing_page" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "book_categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" text PRIMARY KEY NOT NULL,
	"authors" text DEFAULT '' NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(4, 2) DEFAULT 0 NOT NULL,
	"category_id" integer,
	"description" text DEFAULT '' NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"etag" text DEFAULT '' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_promotion" boolean DEFAULT false NOT NULL,
	"isbn10" text DEFAULT '' NOT NULL,
	"isbn13" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"list_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"published_date" text DEFAULT '' NOT NULL,
	"publisher" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"ratings_count" integer DEFAULT 0 NOT NULL,
	"retail_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"section" text DEFAULT '' NOT NULL,
	"self_link" text DEFAULT '' NOT NULL,
	"shelf" text DEFAULT '' NOT NULL,
	"small_thumbnail_image_link" text DEFAULT '' NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"thumbnail_image_link" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_available_quantity_nonnegative" CHECK ("books"."available_quantity" >= 0),
	CONSTRAINT "books_quantity_nonnegative" CHECK ("books"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" text NOT NULL,
	"cart_id" uuid NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_positive" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" text,
	"book_snapshot" jsonb,
	"category_id" integer,
	"discount_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"final_price" numeric(12, 2) NOT NULL,
	"is_promotion" boolean DEFAULT false NOT NULL,
	"isbn13" text,
	"notes" text,
	"order_id" uuid NOT NULL,
	"original_price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"notes" text,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"order_discount_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"payment_method" text,
	"sales_person_id" uuid,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT 0 NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"transaction_id" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_brand" text NOT NULL,
	"card_exp_month" integer NOT NULL,
	"card_exp_year" integer NOT NULL,
	"card_last4" text NOT NULL,
	"card_type" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"name_on_card" text NOT NULL,
	"payment_processor" text NOT NULL,
	"provider_reference" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"city" text,
	"country" text,
	"emulating_role" "user_role",
	"first_name" text,
	"last_name" text,
	"phone" text,
	"postal_code" text,
	"province" text,
	"shipping_city" text,
	"shipping_country" text,
	"shipping_first_name" text,
	"shipping_last_name" text,
	"shipping_phone" text,
	"shipping_postal_code" text,
	"shipping_province" text,
	"shipping_state" text,
	"shipping_street_address1" text,
	"shipping_street_address2" text,
	"shipping_zipcode" text,
	"state" text,
	"street_address1" text,
	"street_address2" text,
	"theme" text DEFAULT 'system' NOT NULL,
	"zipcode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_book_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."book_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "authentication_attempts_email_created_index" ON "authentication_attempts" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "books_category_id_index" ON "books" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "books_featured_index" ON "books" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "books_title_index" ON "books" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_book_unique" ON "cart_items" USING btree ("cart_id","book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_user_id_unique" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_index" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_order_date_index" ON "orders" USING btree ("order_date");--> statement-breakpoint
CREATE INDEX "orders_sales_person_id_index" ON "orders" USING btree ("sales_person_id");--> statement-breakpoint
CREATE INDEX "orders_status_index" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_user_id_index" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_index" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_unique" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "payment_methods_user_id_index" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_index" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));