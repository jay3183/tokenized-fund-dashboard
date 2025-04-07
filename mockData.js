// mockData.js

// Create a date timestamp for exact control
const now = new Date();
const NAV_DATA = [];
const YIELD_DATA = [];

// Force unique values for early morning yield data
const createUniqueEarlyHoursData = () => {
  const earlyData = [];
  
  // Create a lookup to ensure all values are different
  const seenValues = new Set();
  
  // Start with a base pattern - but we'll ensure each actual value is unique
  const baseValues = [1.51, 1.52, 1.53, 1.54, 1.55, 1.56, 1.57, 1.58, 1.59, 1.60,
                    1.62, 1.64, 1.66, 1.68, 1.70, 1.72, 1.74, 1.76, 1.78, 1.80];
  
  // For each hour in the early period, create guaranteed-unique data
  for (let hour = 0; hour < 8; hour++) {
    // Create 12 points per hour (5-minute intervals)
    for (let i = 0; i < 12; i++) {
      // Get a base value from our pattern
      const index = (hour * 12 + i) % baseValues.length;
      const baseValue = baseValues[index];
      
      // Add variations based on time of day plus a random component
      const timeVariation = Math.sin((hour * 12 + i) * 0.2) * 0.1;
      const randomVariation = (Math.random() - 0.5) * 0.12;
      let yieldValue = parseFloat((baseValue + timeVariation + randomVariation).toFixed(3));
      
      // Ensure value is unique by adding jitter until it's different from any seen value
      while (seenValues.has(yieldValue)) {
        yieldValue += 0.001 * (Math.random() > 0.5 ? 1 : -1);
        yieldValue = parseFloat(yieldValue.toFixed(3));
      }
      
      // Record that we've seen this value
      seenValues.add(yieldValue);
      
      // Add the guaranteed-unique value to our data
      earlyData.push(yieldValue);
    }
  }
  
  // Ensure the values are within reasonable bounds
  return earlyData.map(value => Math.max(1.0, Math.min(2.0, value)));
};

// Generate the early hours data once with guaranteed unique values
const earlyHoursData = createUniqueEarlyHoursData();

// Generate realistic data points every 5 minutes
for (let i = 0; i <= 288; i++) {
  const timestamp = new Date(now.getTime() - (288 - i) * 5 * 60 * 1000); // every 5 minutes
  const nav = 100 + Math.sin(i / 10) * 1.2 + Math.random() * 0.2;
  let yieldPct;
  
  // Use our pre-generated data for early hours points (first 8 hours = 96 points)
  if (i < 96) {
    // Use the guaranteed-unique value from our pre-generated array
    yieldPct = earlyHoursData[i];
    
    // Add a tiny bit of extra jitter for visual appeal
    yieldPct += (Math.random() - 0.5) * 0.001;
  }
  // Mid-morning (8-12 hours)
  else if (i < 144) {
    const hourOfDay = timestamp.getHours();
    const baseValue = 1.4 + (hourOfDay * 0.03); 
    
    // Multiple wave patterns at different frequencies
    const wave1 = Math.sin(i / 6.5) * 0.18;   
    const wave2 = Math.cos(i / 15.3) * 0.15;  
    const wave3 = Math.sin(i / 27.7) * 0.1;    
    
    // Random component that varies by hour
    const randomFactor = (Math.random() - 0.5) * 0.15;
    
    // Previous value for continuity
    const prevYield = YIELD_DATA.length > 0 ? YIELD_DATA[YIELD_DATA.length-1].yield : baseValue;
    
    // Blend new calculation with previous value (85% new, 15% previous)
    yieldPct = baseValue + wave1 + wave2 + wave3 + randomFactor;
    yieldPct = 0.85 * yieldPct + 0.15 * prevYield;
    
    // Ensure value differs from previous
    if (YIELD_DATA.length > 0 && Math.abs(yieldPct - YIELD_DATA[YIELD_DATA.length-1].yield) < 0.005) {
      yieldPct += 0.007 * (Math.random() > 0.5 ? 1 : -1);
    }
  }
  // Trading hours (12-18 hours)
  else if (i < 216) {
    const hourOfDay = timestamp.getHours();
    const baseValue = 1.4 + ((i - 144) / 72) * 0.3; // Ramp up during trading day
    
    // Market-like patterns
    const marketPattern = Math.sin(i / 12) * 0.15 + Math.cos(i / 23) * 0.1;
    const volatility = Math.random() * 0.12;
    
    // Previous value for continuity 
    const prevYield = YIELD_DATA.length > 0 ? YIELD_DATA[YIELD_DATA.length-1].yield : baseValue;
    
    // Combine components
    yieldPct = baseValue + marketPattern + volatility;
    
    // Blend with previous (90% new, 10% previous)
    yieldPct = 0.9 * yieldPct + 0.1 * prevYield;
    
    // Ensure value differs from previous
    if (YIELD_DATA.length > 0 && Math.abs(yieldPct - YIELD_DATA[YIELD_DATA.length-1].yield) < 0.005) {
      yieldPct += 0.006 * (Math.random() > 0.5 ? 1 : -1);
    }
  }
  // Evening (18-24 hours)
  else {
    const hourOfDay = timestamp.getHours();
    const baseValue = 1.6 - (hourOfDay > 16 ? (hourOfDay - 16) * 0.02 : 0);
    
    // Pattern components
    const pattern = Math.sin(i / 15) * 0.1 + Math.cos(i / 33) * 0.12;
    const noise = Math.random() * 0.1;
    
    // Previous value component
    const prevYield = YIELD_DATA.length > 0 ? YIELD_DATA[YIELD_DATA.length-1].yield : baseValue;
    
    // Combine
    yieldPct = baseValue + pattern + noise;
    
    // Blend with previous
    yieldPct = 0.92 * yieldPct + 0.08 * prevYield;
    
    // Ensure value differs from previous
    if (YIELD_DATA.length > 0 && Math.abs(yieldPct - YIELD_DATA[YIELD_DATA.length-1].yield) < 0.005) {
      yieldPct += 0.005 * (Math.random() > 0.5 ? 1 : -1);
    }
  }
  
  // Ensure yield stays positive and reasonable
  yieldPct = Math.max(0.8, Math.min(2.2, yieldPct));
  
  NAV_DATA.push({ 
    timestamp: timestamp.toISOString(), 
    nav: parseFloat(nav.toFixed(2)),
    fundId: "F1"
  });
  YIELD_DATA.push({ timestamp: timestamp.toISOString(), yield: parseFloat(yieldPct.toFixed(3)) });
}

export const users = [
  {
    id: "I1",
    name: "Jason",
    holdings: [
      {
        fundId: "F1",
        units: 100,
      },
    ],
  },
];

export const funds = [
  {
    id: "F1",
    name: "OnChain Growth Fund",
    chainId: "stellar-public",
    assetType: "mutual_fund",
    currentNav: NAV_DATA[NAV_DATA.length - 1].nav,
    intradayYield: YIELD_DATA[YIELD_DATA.length - 1].yield,
    totalAUM: 22400000,
    navHistory: NAV_DATA,
    yieldHistory: YIELD_DATA,
  },
];

export const auditLogs = [
  {
    id: "AL1",
    actor: "system",
    action: "NAV_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    metadata: { previousNav: 100.00, newNav: NAV_DATA[NAV_DATA.length - 10].nav }
  },
  {
    id: "AL2",
    actor: "admin@fund.com",
    action: "NAV_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    metadata: { previousNav: 102.25, newNav: 102.75, source: "Bloomberg" }
  },
  {
    id: "AL3",
    actor: "Jason",
    action: "MINT",
    target: "F1",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { sharesMinted: 50, amountUSD: 5000, navUsed: 100.00 }
  },
  {
    id: "AL4",
    actor: "Jason",
    action: "REDEEM",
    target: "F1",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metadata: { sharesRedeemed: 10, amountUSD: 1050, navUsed: 105.00 }
  },
  {
    id: "AL5",
    actor: "system",
    action: "YIELD_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    metadata: { previousYield: 4.25, newYield: 4.50 }
  },
  {
    id: "AL6",
    actor: "system",
    action: "NAV_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    metadata: { previousNav: 102.75, newNav: 103.05, source: "Auto-calculation" }
  },
  {
    id: "AL7",
    actor: "Sarah",
    action: "MINT",
    target: "F1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { sharesMinted: 25, amountUSD: 2575, navUsed: 103.00 }
  },
  {
    id: "AL8",
    actor: "Michael",
    action: "REDEEM",
    target: "F1",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: { sharesRedeemed: 40, amountUSD: 4120, navUsed: 103.00 }
  },
  {
    id: "AL9",
    actor: "admin@fund.com",
    action: "YIELD_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    metadata: { previousYield: 4.10, newYield: 4.25, source: "Manual adjustment" }
  },
  {
    id: "AL10",
    actor: "compliance@fund.com",
    action: "AUDIT_CHECK",
    target: "F1",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: { status: "PASSED", notes: "Daily compliance verification complete" }
  },
  {
    id: "AL11",
    actor: "system",
    action: "NAV_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    metadata: { previousNav: 103.05, newNav: 103.12, source: "Auto-calculation" }
  },
  {
    id: "AL12",
    actor: "system",
    action: "YIELD_UPDATE",
    target: "F1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    metadata: { previousYield: 4.50, newYield: 4.52 }
  }
];
  