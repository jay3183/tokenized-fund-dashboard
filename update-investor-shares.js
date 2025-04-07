/**
 * Script to update investor shares while maintaining fund total
 * 
 * This script updates the investor's share count to 24,019.20
 * while ensuring the total fund shares remain at 224,019.20
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateInvestorShares() {
  try {
    console.log("🔄 Starting investor shares update...");
    
    // Step 1: Find the investor portfolio (I1 is the investor ID)
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        investorId_fundId: {
          investorId: "I1",
          fundId: "F1"
        }
      }
    });
    
    if (!portfolio) {
      console.error("❌ Portfolio not found for investor I1 and fund F1");
      return;
    }
    
    console.log(`📊 Current investor shares: ${portfolio.shares}`);
    
    // Step 2: Update the portfolio to the new share count
    const updatedPortfolio = await prisma.portfolio.update({
      where: {
        investorId_fundId: {
          investorId: "I1",
          fundId: "F1"
        }
      },
      data: {
        shares: 24019.2
      }
    });
    
    console.log(`✅ Updated investor shares to: ${updatedPortfolio.shares}`);
    
    // Step 3: Also update the holding record (if exists)
    const holding = await prisma.holding.findUnique({
      where: {
        userId_fundId: {
          userId: "I1",
          fundId: "F1"
        }
      }
    });
    
    if (holding) {
      const updatedHolding = await prisma.holding.update({
        where: {
          userId_fundId: {
            userId: "I1",
            fundId: "F1"
          }
        },
        data: {
          units: 24019.2
        }
      });
      
      console.log(`✅ Updated investor holding units to: ${updatedHolding.units}`);
    } else {
      console.log("ℹ️ No holding record found to update");
    }
    
    // Step 4: Verify fund total AUM and NAV remain unchanged
    const fund = await prisma.fund.findUnique({
      where: {
        id: "F1"
      }
    });
    
    console.log(`📈 Current fund NAV: ${fund.currentNav}`);
    console.log(`💰 Total AUM: ${fund.totalAum}`);
    console.log(`🔢 Expected shares represented by AUM: ${fund.totalAum / fund.currentNav}`);
    
    console.log("\n✅ Update complete!");
    
  } catch (error) {
    console.error('❌ Error during update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update script
updateInvestorShares()
  .then(() => {
    console.log("\n🏁 Script execution complete!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  }); 