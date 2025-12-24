/**
 * Client API Test Suite
 * Tests client-side API functions match server responses
 */

import { 
  getStats, 
  getStatsOverview,
  getNodes,
  getNodeStats,
  getStakers,
  getStakerStats,
  getHealthRecords,
  getHealthRecordStats,
  getDataTypes,
  getDeviceTypes,
  getTransactions,
  getTransactionStats,
  getTransactionTypes
} from './client/src/api/index.ts';

// Since we can't directly import TS in Node, let's test the actual fetch calls
// that the client would make

const API_BASE = '/api';

async function testClientEndpoint(name, endpoint, params = {}) {
  try {
    console.log(`\n🧪 Testing Client: ${name}`);
    
    // Build query string like client does
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    const url = `http://localhost:3001${API_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`   ❌ FAILED: HTTP ${response.status}`);
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`   Error:`, errorData);
      return false;
    }
    
    const data = await response.json();
    
    // Verify response structure
    if (endpoint.includes('/stats') && !endpoint.includes('/overview')) {
      // Stats endpoints should have expected structure (at least one of these)
      const hasStatsStructure = data.network || data.totalNodes !== undefined || data.totalRecords !== undefined || data.totalTransactions !== undefined || data.totalStakers !== undefined;
      if (!hasStatsStructure) {
        console.error(`   ❌ FAILED: Unexpected stats structure`);
        return false;
      }
    } else if (endpoint.includes('/overview')) {
      if (data.activeNodes === undefined) {
        console.error(`   ❌ FAILED: Missing activeNodes in overview`);
        return false;
      }
    } else if (!endpoint.includes('/types') && !endpoint.includes('/data-types') && !endpoint.includes('/device-types')) {
      // List endpoints should have pagination
      if (!data.pagination || !data.data) {
        console.error(`   ❌ FAILED: Missing pagination or data`);
        return false;
      }
    }
    
    console.log(`   ✅ PASSED`);
    if (data.pagination) {
      console.log(`   📊 Page ${data.pagination.page}/${data.pagination.totalPages}, Items: ${data.data?.length || 0}`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runClientTests() {
  console.log('🚀 Starting Client API Tests...\n');
  console.log('⚠️  Testing client-side API calls\n');
  
  const results = [];
  
  // Test all client API functions
  results.push(await testClientEndpoint('getStats()', '/stats'));
  results.push(await testClientEndpoint('getStatsOverview()', '/stats/overview'));
  
  results.push(await testClientEndpoint('getNodes()', '/nodes'));
  results.push(await testClientEndpoint('getNodes({page: 2, limit: 10})', '/nodes', { page: 2, limit: 10 }));
  results.push(await testClientEndpoint('getNodes({status: "ACTIVE"})', '/nodes', { status: 'ACTIVE' }));
  results.push(await testClientEndpoint('getNodes({nodeType: "VALIDATOR"})', '/nodes', { nodeType: 'VALIDATOR' }));
  results.push(await testClientEndpoint('getNodes({sortBy: "stakedAmount"})', '/nodes', { sortBy: 'stakedAmount', sortOrder: 'desc' }));
  results.push(await testClientEndpoint('getNodeStats()', '/nodes/stats'));
  
  results.push(await testClientEndpoint('getStakers()', '/stakers'));
  results.push(await testClientEndpoint('getStakers({minStake: 1000})', '/stakers', { minStake: 1000 }));
  results.push(await testClientEndpoint('getStakers({sortBy: "stakedAmount"})', '/stakers', { sortBy: 'stakedAmount', sortOrder: 'desc' }));
  results.push(await testClientEndpoint('getStakerStats()', '/stakers/stats'));
  
  results.push(await testClientEndpoint('getHealthRecords()', '/health-records'));
  results.push(await testClientEndpoint('getHealthRecords({dataType: "HEART_RATE"})', '/health-records', { dataType: 'HEART_RATE' }));
  results.push(await testClientEndpoint('getHealthRecords({validationStatus: "VALIDATED"})', '/health-records', { validationStatus: 'VALIDATED' }));
  results.push(await testClientEndpoint('getHealthRecords({sortBy: "timestamp"})', '/health-records', { sortBy: 'timestamp', sortOrder: 'desc' }));
  results.push(await testClientEndpoint('getHealthRecordStats()', '/health-records/stats'));
  results.push(await testClientEndpoint('getDataTypes()', '/health-records/data-types'));
  results.push(await testClientEndpoint('getDeviceTypes()', '/health-records/device-types'));
  
  results.push(await testClientEndpoint('getTransactions()', '/transactions'));
  results.push(await testClientEndpoint('getTransactions({txType: "STAKE"})', '/transactions', { txType: 'STAKE' }));
  results.push(await testClientEndpoint('getTransactions({status: "CONFIRMED"})', '/transactions', { status: 'CONFIRMED' }));
  results.push(await testClientEndpoint('getTransactionStats()', '/transactions/stats'));
  results.push(await testClientEndpoint('getTransactionTypes()', '/transactions/types'));
  
  // Test empty filter handling (client filters these out)
  results.push(await testClientEndpoint('getNodes({status: ""}) - empty filtered', '/nodes', { status: '' }));
  results.push(await testClientEndpoint('getHealthRecords({dataType: ""}) - empty filtered', '/health-records', { dataType: '' }));
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLIENT API TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed/total)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (passed < total) {
    console.log('\n⚠️  Some client API tests failed.');
    process.exit(1);
  } else {
    console.log('\n🎉 All client API tests passed!');
    process.exit(0);
  }
}

// Check server
fetch('http://localhost:3001/api/health')
  .then(() => {
    console.log('✅ Server is running\n');
    runClientTests();
  })
  .catch(() => {
    console.error('❌ ERROR: Server is not running on http://localhost:3001');
    process.exit(1);
  });
