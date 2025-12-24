/**
 * ChainHealth AI - Mock Data Generator
 * =====================================
 * Generates clean mock data for the assessment
 * 
 * Run with: node generator.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  nodes: 100,
  stakers: 500,
  healthRecords: 2000,
  epochs: 30,
  transactions: 1000
};

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAddress() {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[randomInt(0, 15)];
  }
  return addr;
}

function randomHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[randomInt(0, 15)];
  }
  return hash;
}

function padNumber(num, width) {
  return String(num).padStart(width, '0');
}

// Generate nodes
function generateNodes(count) {
  const types = ['VALIDATOR', 'LIGHT', 'RELAY', 'ARCHIVE'];
  const regions = ['NA-EAST', 'NA-WEST', 'EU-WEST', 'EU-EAST', 'ASIA-PACIFIC', 'LATAM'];
  const statuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'SLASHED'];
  const hardware = ['AWS-T3', 'GCP-E2', 'AZURE-B2', 'BARE-METAL', 'HOME-SERVER'];
  
  const nodes = [];
  
  for (let i = 1; i <= count; i++) {
    const validationsPerformed = randomInt(10000, 500000);
    const successRate = randomFloat(0.90, 0.99, 4);
    
    nodes.push({
      nodeId: `NODE-${padNumber(i, 6)}`,
      operatorAddress: randomAddress(),
      nodeType: randomChoice(types),
      region: randomChoice(regions),
      status: randomChoice(statuses),
      stakedAmount: randomFloat(1000, 100000, 6),
      totalRewardsEarned: randomFloat(100, 5000, 6),
      uptime: randomFloat(70, 99.99, 4),
      validationsPerformed,
      validationsSuccessful: Math.floor(validationsPerformed * successRate),
      validationsFailed: Math.floor(validationsPerformed * (1 - successRate)),
      slashingEvents: randomInt(0, 3),
      registeredAt: Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000,
      lastHeartbeat: Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000,
      metadata: {
        version: `v${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`,
        hardware: randomChoice(hardware),
        bandwidth: randomInt(500, 10000)
      }
    });
  }
  
  return nodes;
}

// Generate stakers
function generateStakers(count, nodes) {
  const lockPeriods = [7, 14, 30, 60, 90, 180, 365];
  const stakers = [];
  
  for (let i = 1; i <= count; i++) {
    const lockPeriod = randomChoice(lockPeriods);
    const stakedAmount = randomFloat(100, 50000, 6);
    
    stakers.push({
      stakerId: `STAKER-${padNumber(i, 7)}`,
      walletAddress: randomAddress(),
      stakedAmount,
      pendingRewards: randomFloat(10, 500, 6),
      claimedRewards: randomFloat(100, 2000, 6),
      lockPeriod,
      unlockTime: Date.now() + lockPeriod * 24 * 60 * 60 * 1000,
      stakingMultiplier: 1 + (lockPeriod / 365),
      delegatedTo: randomChoice(nodes).nodeId
    });
  }
  
  return stakers;
}

// Generate health records
function generateHealthRecords(count) {
  const dataTypes = ['HEART_RATE', 'STEPS', 'SLEEP', 'ACTIVE_MINUTES', 'CALORIES', 'BLOOD_OXYGEN', 'STRESS', 'HRV'];
  const deviceTypes = ['APPLE_WATCH', 'FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'SAMSUNG', 'XIAOMI'];
  const validationStatuses = ['VALIDATED', 'PENDING', 'REJECTED'];
  
  const units = {
    HEART_RATE: 'bpm',
    STEPS: 'steps',
    SLEEP: 'minutes',
    ACTIVE_MINUTES: 'minutes',
    CALORIES: 'kcal',
    BLOOD_OXYGEN: '%',
    STRESS: 'score',
    HRV: 'ms'
  };
  
  const valueRanges = {
    HEART_RATE: [50, 180],
    STEPS: [1000, 20000],
    SLEEP: [180, 600],
    ACTIVE_MINUTES: [0, 300],
    CALORIES: [1200, 4000],
    BLOOD_OXYGEN: [92, 100],
    STRESS: [1, 100],
    HRV: [20, 100]
  };
  
  const records = [];
  const userAddresses = Array.from({ length: 200 }, () => randomAddress());
  const nodeIds = Array.from({ length: 100 }, (_, i) => `NODE-${padNumber(i + 1, 6)}`);
  
  for (let i = 1; i <= count; i++) {
    const dataType = randomChoice(dataTypes);
    const range = valueRanges[dataType];
    
    records.push({
      recordId: `REC-${padNumber(i, 8)}`,
      userAddress: randomChoice(userAddresses),
      dataType,
      value: dataType === 'BLOOD_OXYGEN' ? randomFloat(range[0], range[1], 1) : randomInt(range[0], range[1]),
      unit: units[dataType],
      deviceType: randomChoice(deviceTypes),
      timestamp: Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
      validatedBy: randomChoice(nodeIds),
      validationStatus: randomChoice(validationStatuses),
      rewardEarned: randomFloat(0.1, 5, 4)
    });
  }
  
  return records;
}

// Generate epochs
function generateEpochs(count, nodes) {
  const epochs = [];
  const epochDuration = 7 * 24 * 60 * 60 * 1000; // 1 week
  const baseTime = Date.now() - count * epochDuration;
  
  for (let i = 1; i <= count; i++) {
    const startTime = baseTime + (i - 1) * epochDuration;
    const activeNodes = randomInt(Math.floor(nodes.length * 0.7), nodes.length);
    
    const nodeRewards = nodes.slice(0, Math.min(20, nodes.length)).map(node => ({
      nodeId: node.nodeId,
      reward: randomFloat(100, 2000, 6),
      validations: randomInt(1000, 10000)
    }));
    
    epochs.push({
      epochNumber: i,
      startTime,
      endTime: startTime + epochDuration,
      totalRewardsPool: randomFloat(50000, 200000, 6),
      totalValidations: randomInt(50000, 150000),
      activeNodes,
      activeStakers: randomInt(300, 500),
      nodeRewards
    });
  }
  
  return epochs;
}

// Generate transactions
function generateTransactions(count) {
  const txTypes = ['TRANSFER', 'STAKE', 'UNSTAKE', 'CLAIM_REWARD', 'DELEGATE', 'UNDELEGATE'];
  const statuses = ['CONFIRMED', 'PENDING', 'FAILED'];
  
  const transactions = [];
  
  for (let i = 1; i <= count; i++) {
    transactions.push({
      txHash: randomHash(),
      txType: randomChoice(txTypes),
      from: randomAddress(),
      to: randomAddress(),
      amount: randomFloat(10, 5000, 6),
      gasUsed: randomInt(21000, 200000),
      gasPrice: randomInt(20, 200),
      timestamp: Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
      blockNumber: randomInt(18000000, 19000000),
      status: randomChoice(statuses),
      nonce: randomInt(1, 1000)
    });
  }
  
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Main generation
function generate() {
  console.log('Generating mock data...');
  
  const nodes = generateNodes(CONFIG.nodes);
  console.log(`✓ Generated ${nodes.length} nodes`);
  
  const stakers = generateStakers(CONFIG.stakers, nodes);
  console.log(`✓ Generated ${stakers.length} stakers`);
  
  const healthRecords = generateHealthRecords(CONFIG.healthRecords);
  console.log(`✓ Generated ${healthRecords.length} health records`);
  
  const epochs = generateEpochs(CONFIG.epochs, nodes);
  console.log(`✓ Generated ${epochs.length} epochs`);
  
  const transactions = generateTransactions(CONFIG.transactions);
  console.log(`✓ Generated ${transactions.length} transactions`);
  
  const metadata = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    counts: {
      nodes: nodes.length,
      stakers: stakers.length,
      healthRecords: healthRecords.length,
      epochs: epochs.length,
      transactions: transactions.length
    }
  };
  
  const output = `/**
 * ChainHealth AI - Generated Mock Data
 * =====================================
 * Auto-generated by generator.js
 * Generated at: ${metadata.generatedAt}
 * 
 * DO NOT EDIT THIS FILE MANUALLY!
 * Run "node generator.js" to regenerate.
 */

const metadata = ${JSON.stringify(metadata, null, 2)};

const nodes = ${JSON.stringify(nodes, null, 2)};

const stakers = ${JSON.stringify(stakers, null, 2)};

const healthRecords = ${JSON.stringify(healthRecords, null, 2)};

const epochs = ${JSON.stringify(epochs, null, 2)};

const transactions = ${JSON.stringify(transactions, null, 2)};

module.exports = {
  metadata,
  nodes,
  stakers,
  healthRecords,
  epochs,
  transactions
};
`;

  const outputPath = path.join(__dirname, 'data.js');
  fs.writeFileSync(outputPath, output);
  console.log(`\n✓ Data written to ${outputPath}`);
  console.log(`  File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

generate();

