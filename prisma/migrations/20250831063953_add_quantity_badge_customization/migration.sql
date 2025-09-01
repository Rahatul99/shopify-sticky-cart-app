-- AlterTable
ALTER TABLE "public"."sticky_cart_settings" ADD COLUMN     "quantityBadgeHeight" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "quantityBadgeRadius" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "quantityBadgeWidth" INTEGER NOT NULL DEFAULT 24;
