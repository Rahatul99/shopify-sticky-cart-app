import prisma from "../db.server";

export const getShop = async (domain) => {
  return prisma.shop.findUnique({
    where: { domain },
    include: {
      stickyCartSettings: true,
    },
  });
};

export const createShop = async (domain) => {
  return prisma.shop.create({
    data: { domain },
    include: {
      stickyCartSettings: true,
    },
  });
};

export const getStickyCartSettings = async (shopId) => {
  return prisma.stickyCartSettings.findUnique({
    where: { shopId },
  });
};

export const createOrUpdateStickyCartSettings = async (shopId, settings) => {
  return prisma.stickyCartSettings.upsert({
    where: { shopId },
    update: settings,
    create: {
      shopId,
      ...settings,
    },
  });
};

export const getStickyCartSettingsByDomain = async (domain) => {
  const shop = await prisma.shop.findUnique({
    where: { domain },
    include: {
      stickyCartSettings: true,
    },
  });

  return shop?.stickyCartSettings;
};
