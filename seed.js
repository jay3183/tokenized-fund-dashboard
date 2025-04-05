const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create or ensure Fund F1 exists
  const fund = await prisma.fund.upsert({
    where: { id: "F1" },
    update: {},
    create: {
      id: "F1",
      name: "OnChain Growth Fund",
      chainId: "stellar-public",
      assetType: "mutual_fund",
      currentNav: 100,
      intradayYield: 1.25,
      totalAum: 22400000
    }
  });

  // Create or ensure User I1 exists with 100 shares in F1
  const user = await prisma.user.upsert({
    where: { id: "I1" },
    update: {},
    create: {
      id: "I1",
      name: "Jason",
      holdings: {
        create: {
          fundId: "F1",
          units: 100
        }
      }
    }
  });

  // Create a sample AuditLog entry
  await prisma.auditLog.create({
    data: {
      actor: "system",
      action: "NAV_SEED",
      target: "F1",
      timestamp: new Date().toISOString(),
      metadata: {
        message: "Initial NAV seeded"
      },
      fundId: "F1"
    }
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });