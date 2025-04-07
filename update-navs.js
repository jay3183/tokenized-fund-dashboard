const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateFundNavs() {
  try {
    // Update the fund with id F1 to have a clear, visible difference between previous and current NAV
    // Using a much larger difference to ensure the percentage change is clearly visible
    const updatedFund = await prisma.fund.update({
      where: { id: 'F1' },
      data: {
        previousNav: 105.00,  // Set a lower previousNav 
        currentNav: 117.07    // Keep the current NAV
      }
    });
    
    // Calculate the percentage difference
    const percentageDiff = ((updatedFund.currentNav - updatedFund.previousNav) / updatedFund.previousNav * 100).toFixed(2);
    
    console.log('Fund NAVs updated successfully:', {
      id: updatedFund.id,
      name: updatedFund.name,
      previousNav: updatedFund.previousNav,
      currentNav: updatedFund.currentNav,
      percentageDiff: percentageDiff + '%'
    });
    
    console.log(`The NAV percentage change should now display as +${percentageDiff}%`);
  } catch (error) {
    console.error('Error updating fund NAVs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFundNavs(); 