-- AlterTable
ALTER TABLE "public"."sticky_cart_settings" ADD COLUMN     "customIconHeight" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "customIconWidth" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "priceBackgroundColor" TEXT NOT NULL DEFAULT 'transparent',
ADD COLUMN     "quantityBadgePosition" TEXT NOT NULL DEFAULT 'top-right';
