// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a fund
  const fund = await prisma.fund.create({
    data: {
      id: "F1",
      name: "OnChain Growth Fund",
      chainId: "stellar-public",
      assetType: "mutual_fund",
      currentNav: 100.00,
      intradayYield: 1.25,
      totalAum: 1000000,
    },
  });

  // Create a user
  const user = await prisma.user.create({
    data: {
      id: "1",
      name: "Jason",
    },
  });

  // Create a holding (portfolio)
  await prisma.holding.create({
    data: {
      fundId: fund.id,
      userId: user.id,
      units: 100,
    },
  });

  // Add an audit log (✅ updated here)
  await prisma.auditLog.create({
    data: {
      actor: "system",
      action: "NAV_SEED",
      target: fund.id,
      fundId: fund.id, // ✅ fix
      timestamp: new Date().toISOString(),
      metadata: {
        message: "Initial NAV seeded",
      },
    },
  });
}

main()
  .then(() => {
    console.log("✅ Seed complete");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Seed error:", e);
    return prisma.$disconnect();
  });