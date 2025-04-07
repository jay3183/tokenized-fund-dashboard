/**
 * Backfill Script for YieldSnapshot
 * 
 * This script generates 60 minutes of synthetic YieldSnapshot data
 * at 1-minute intervals for all funds in the database.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillYieldSnapshots() {
  try {
    console.log("🔄 Starting YieldSnapshot backfill...");
    
    // Get all funds from database
    const funds = await prisma.fund.findMany();
    console.log(`📊 Found ${funds.length} funds to backfill`);
    
    const now = new Date();
    const results = [];
    
    // Process each fund
    for (const fund of funds) {
      console.log(`⚙️ Processing fund: ${fund.id} (${fund.name})`);
      
      // Current yield value as base
      const baseYield = fund.intradayYield;
      console.log(`📈 Current yield: ${baseYield.toFixed(4)}%`);
      
      // Generate backfill records for the last 60 minutes
      const backfillRecords = [];
      
      // Loop from 60 minutes ago to now (1 minute intervals)
      for (let minutesAgo = 60; minutesAgo > 0; minutesAgo--) {
        // Create timestamp for this minute
        const timestamp = new Date(now.getTime() - (minutesAgo * 60 * 1000));
        
        // Generate a realistic yield value with small delta from base
        // More variation as we go back in time (older values)
        const volatility = 0.05 + (minutesAgo / 300); // Increases slightly with time ago
        const delta = (Math.random() - 0.5) * volatility;
        
        // Add small time-based pattern (slight uptrend in morning, downtrend in afternoon)
        const hour = timestamp.getHours();
        let trendAdjustment = 0;
        if (hour < 12) {
          // Morning - slight uptrend
          trendAdjustment = 0.002 * (12 - minutesAgo / 60);
        } else {
          // Afternoon - slight downtrend
          trendAdjustment = -0.001 * (12 - minutesAgo / 60);
        }
        
        // Calculate yield for this point
        let yieldValue = baseYield - (delta + trendAdjustment);
        
        // Add occasional spikes (5% chance)
        if (Math.random() < 0.05) {
          const spikeDirection = Math.random() > 0.5 ? 1 : -1;
          const spikeMagnitude = 0.05 + Math.random() * 0.15;
          yieldValue += spikeDirection * spikeMagnitude;
          console.log(`🔥 Added spike at ${timestamp.toISOString()}: ${spikeDirection > 0 ? '+' : ''}${(spikeDirection * spikeMagnitude).toFixed(4)}%`);
        }
        
        // Ensure yield doesn't go below 0.5%
        yieldValue = Math.max(yieldValue, 0.5);
        yieldValue = parseFloat(yieldValue.toFixed(4));
        
        // Add to records array
        backfillRecords.push({
          fundId: fund.id,
          yield: yieldValue,
          timestamp: timestamp,
          source: minutesAgo % 15 === 0 ? 'system' : 'backfill'
        });
      }
      
      // Insert all records for this fund
      for (const record of backfillRecords) {
        const snapshot = await prisma.yieldSnapshot.create({
          data: record
        });
        
        // Log every 15th record for visibility (not to flood console)
        if (backfillRecords.indexOf(record) % 15 === 0 || backfillRecords.indexOf(record) === 0) {
          console.log(`📝 Created snapshot: time=${record.timestamp.toISOString()}, yield=${record.yield}%`);
        }
      }
      
      results.push({
        fundId: fund.id,
        recordsCreated: backfillRecords.length
      });
    }
    
    console.log("\n✅ Backfill complete!");
    console.log("📊 Summary:");
    results.forEach(result => {
      console.log(`  Fund ${result.fundId}: ${result.recordsCreated} snapshots created`);
    });
    
  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill script
backfillYieldSnapshots()
  .then(() => {
    console.log("\n🏁 Script execution complete!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  }); 