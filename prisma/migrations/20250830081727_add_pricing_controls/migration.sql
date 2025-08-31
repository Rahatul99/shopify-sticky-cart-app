-- AlterTable
ALTER TABLE "public"."sticky_cart_settings" ADD COLUMN     "customCSS" TEXT,
ADD COLUMN     "pricingFontSize" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "pricingFontWeight" TEXT NOT NULL DEFAULT '500',
ADD COLUMN     "pricingTextColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "showPricing" BOOLEAN NOT NULL DEFAULT true;
