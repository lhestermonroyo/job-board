ALTER TABLE "organization_user_settings" DROP CONSTRAINT "organization_user_settings_email_unique";--> statement-breakpoint
ALTER TABLE "organization_user_settings" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "organization_user_settings" DROP COLUMN "imageUrl";--> statement-breakpoint
ALTER TABLE "organization_user_settings" DROP COLUMN "email";