import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Prisma seed script provisioning an admin account and demo سرو products.
 */
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { phone: "09123456789" },
    update: {},
    create: {
      name: "مدیر سرو",
      phone: "09123456789",
      passwordHash,
      role: "admin",
      subscriptionTier: "PROFESSIONAL",
      active: true // Admin is always active
    }
  });

  const demoProducts = [
    { name: "اسپرسو", price: 3.0, category: "نوشیدنی" },
    { name: "کاپوچینو", price: 4.5, category: "نوشیدنی" },
    { name: "مافین بلوبری", price: 2.75, category: "شیرینی" }
  ];

  for (const product of demoProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });
    
    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          category: product.category,
          stock: 25
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
