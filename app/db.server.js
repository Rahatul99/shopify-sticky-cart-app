//This ensures a single Prisma Client instance is used across the app, avoiding connection issues.
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Force refresh the Prisma client in development by clearing the global cache
  if (global.__prisma) {
    global.__prisma.$disconnect();
    global.__prisma = null;
  }
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export default prisma;
