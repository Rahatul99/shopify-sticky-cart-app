/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Settings" DROP CONSTRAINT "Settings_shopId_fkey";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."Settings";

-- DropTable
DROP TABLE "public"."Shop";

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sticky_cart_settings" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cartPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "backgroundColor" TEXT NOT NULL DEFAULT '#000000',
    "iconColor" TEXT NOT NULL DEFAULT '#ffffff',
    "buttonRadius" INTEGER NOT NULL DEFAULT 50,
    "width" INTEGER NOT NULL DEFAULT 80,
    "height" INTEGER NOT NULL DEFAULT 80,
    "quantityBackgroundColor" TEXT NOT NULL DEFAULT '#ff0000',
    "quantityTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "showQuantityBadge" BOOLEAN NOT NULL DEFAULT true,
    "selectedIcon" TEXT NOT NULL DEFAULT 'cart',
    "customIconUrl" TEXT,
    "deviceVisibility" TEXT NOT NULL DEFAULT 'all',
    "enableHoverAnimation" BOOLEAN NOT NULL DEFAULT true,
    "animationType" TEXT NOT NULL DEFAULT 'bounce',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticky_cart_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_domain_key" ON "public"."shops"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "sticky_cart_settings_shopId_key" ON "public"."sticky_cart_settings"("shopId");

-- AddForeignKey
ALTER TABLE "public"."sticky_cart_settings" ADD CONSTRAINT "sticky_cart_settings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
