-- AlterTable
ALTER TABLE "public"."sticky_cart_settings" ADD COLUMN     "structuredBottomSectionBgColor" TEXT NOT NULL DEFAULT '#f9fafb',
ADD COLUMN     "structuredCurrencySymbol" TEXT NOT NULL DEFAULT '৳',
ADD COLUMN     "structuredItemsTextColor" TEXT NOT NULL DEFAULT '#fbbf24',
ADD COLUMN     "structuredPriceTextColor" TEXT NOT NULL DEFAULT '#374151',
ADD COLUMN     "structuredTopSectionBgColor" TEXT NOT NULL DEFAULT '#6b7280';
