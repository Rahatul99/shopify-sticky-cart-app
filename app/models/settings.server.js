import prisma from "../db.server";

// const prisma = new PrismaClient();

// Avoid logging schema at runtime in production

export async function getShop(domain) {
  return prisma.shop.findUnique({
    where: { domain },
    include: {
      stickyCartSettings: true,
    },
  });
}

export async function createShop(domain) {
  return prisma.shop.create({
    data: { domain },
    include: {
      stickyCartSettings: true,
    },
  });
}

export async function getStickyCartSettings(shopId) {
  return prisma.stickyCartSettings.findUnique({
    where: { shopId },
  });
}

export async function createOrUpdateStickyCartSettings(shopId, settings) {
  return prisma.stickyCartSettings.upsert({
    where: { shopId },
    update: settings,
    create: {
      shopId,
      ...settings,
    },
  });
}

export async function getStickyCartSettingsByDomain(domain) {
  const shop = await prisma.shop.findUnique({
    where: { domain },
    include: {
      stickyCartSettings: true,
    },
  });

  return shop?.stickyCartSettings;
}
