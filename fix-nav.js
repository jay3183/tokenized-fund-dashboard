const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNavValues() {
  try {
    // Get current fund
    const fund = await prisma.fund.findFirst();
    if (!fund) {
      console.error('No fund found!');
      return;
    }
    
    console.log('Current fund values:', {
      id: fund.id,
      name: fund.name,
      currentNav: fund.currentNav,
      previousNav: fund.previousNav
    });
    
    // Set previousNav to exactly 5% lower than currentNav to force a visible difference
    const currentNav = fund.currentNav;
    const previousNav = parseFloat((currentNav * 0.95).toFixed(2)); // 5% lower
    
    // Update the fund with these values
    const updated = await prisma.fund.update({
      where: { id: fund.id },
      data: { 
        previousNav: previousNav,
      }
    });
    
    console.log('Updated fund values:', {
      id: updated.id,
      name: updated.name,
      currentNav: updated.currentNav,
      previousNav: updated.previousNav,
      percentChange: ((updated.currentNav - updated.previousNav) / updated.previousNav * 100).toFixed(2) + '%'
    });
    
  } catch (error) {
    console.error('Error updating NAV values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNavValues(); 