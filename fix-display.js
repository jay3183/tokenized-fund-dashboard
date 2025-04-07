const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNavDisplay() {
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
    
    // Set previousNav to EXACTLY 5% lower than currentNav to force a visible difference
    const currentNav = fund.currentNav;
    const previousNav = parseFloat((currentNav * 0.95).toFixed(2)); // 5% lower
    
    // Update the fund with these values
    const updated = await prisma.fund.update({
      where: { id: fund.id },
      data: { 
        previousNav: previousNav,
      }
    });
    
    // Calculate exact percentage difference
    const percentDiff = ((updated.currentNav - updated.previousNav) / updated.previousNav * 100).toFixed(2);
    
    console.log('Updated fund values:', {
      id: updated.id,
      name: updated.name,
      currentNav: updated.currentNav,
      previousNav: updated.previousNav,
      percentChange: percentDiff + '%'
    });
    
    console.log(`Success! Now the NAV percentage should show as +${percentDiff}%`);
    
  } catch (error) {
    console.error('Error updating NAV values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
fixNavDisplay(); 