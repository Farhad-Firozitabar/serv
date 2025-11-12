import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Prisma seed script provisioning an admin account and demo cafe products.
 */
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@cafepos.dev" },
    update: {},
    create: {
      name: "CafePOS Admin",
      email: "admin@cafepos.dev",
      passwordHash,
      role: "admin",
      subscriptionTier: "PROFESSIONAL"
    }
  });

  const demoProducts = [
    { name: "Espresso", price: 3.0, category: "Beverage" },
    { name: "Cappuccino", price: 4.5, category: "Beverage" },
    { name: "Blueberry Muffin", price: 2.75, category: "Bakery" }
  ];

  for (const product of demoProducts) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: {
        name: product.name,
        price: product.price,
        category: product.category,
        stock: 25
      }
    });
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
