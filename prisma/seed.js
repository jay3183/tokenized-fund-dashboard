// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.yieldSnapshot.deleteMany({});
  await prisma.yieldHistory.deleteMany({});
  await prisma.nAVSnapshot.deleteMany({});
  await prisma.holding.deleteMany({});
  await prisma.portfolio.deleteMany({});
  await prisma.fund.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared. Creating seed data...');

  // Create users with hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const investorPassword = await bcrypt.hash('investor123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const investorUser = await prisma.user.create({
    data: {
      id: 'I1',
      name: 'John Investor',
      email: 'investor@example.com',
      password: investorPassword,
      role: 'INVESTOR',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      id: 'manager1',
      name: 'Fund Manager',
      email: 'manager@example.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  console.log('Created users:');
  console.log('- Admin:', adminUser.email, '(password: admin123)');
  console.log('- Investor:', investorUser.email, '(password: investor123)');
  console.log('- Manager:', managerUser.email, '(password: manager123)');

  // Create fund
  const fund = await prisma.fund.create({
    data: {
      id: 'F1',
      name: 'OnChain Growth Fund',
      chainId: 'ETH',
      assetType: 'Multi-Strategy',
      currentNav: 105.0,
      previousNav: 100.0,
      intradayYield: 1.5,
      totalAum: 2500000,
      inceptionDate: new Date('2023-04-01'),
    },
  });

  console.log('Created fund:', fund.name);

  // Create holding for investor
  const holding = await prisma.holding.create({
    data: {
      userId: investorUser.id,
      fundId: fund.id,
      units: 100,
    },
  });

  console.log('Created holding for investor:', holding.units, 'units');

  // Create portfolio for investor
  const portfolio = await prisma.portfolio.create({
    data: {
      investorId: investorUser.id,
      fundId: fund.id,
      shares: 100,
    },
  });

  console.log('Created portfolio for investor:', portfolio.shares, 'shares');

  // Create some initial NAV history
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Simulate some NAV fluctuations
    const navValue = 100 + (Math.random() * 10 - 2);
    
    await prisma.nAVSnapshot.create({
      data: {
        fundId: fund.id,
        nav: parseFloat(navValue.toFixed(2)),
        timestamp: date,
        source: 'system',
      },
    });
    
    // Create corresponding yield entry
    await prisma.yieldHistory.create({
      data: {
        fundId: fund.id,
        yield: parseFloat((1.0 + Math.random() * 1.5).toFixed(4)),
        timestamp: date,
      },
    });
  }

  console.log('Created historical NAV and yield data');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });