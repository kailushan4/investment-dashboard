/**
 * Test script for data layer
 * Tests fetching NAV history for Bandhan Small Cap (scheme code 147946)
 * Run with: node scripts/test-data-layer.js
 */

const axios = require('axios');

const MFAPI_BASE = 'https://api.mfapi.in';
const BANDHAN_SMALL_CAP_SCHEME = 147946;

async function testMFDataFetch() {
  console.log('🧪 Testing Mutual Fund data fetching...\n');

  try {
    console.log(`📡 Fetching NAV history for Bandhan Small Cap Fund (scheme: ${BANDHAN_SMALL_CAP_SCHEME})...`);
    const response = await axios.get(`${MFAPI_BASE}/mf/${BANDHAN_SMALL_CAP_SCHEME}`);

    const { meta, data } = response.data;

    if (!data || data.length === 0) {
      console.error('❌ No NAV data found');
      return;
    }

    console.log(`✅ Success! Received ${data.length} data points\n`);

    // Show metadata
    console.log('📊 Fund Metadata:');
    console.log(`  Fund Name: ${meta.fundName || 'N/A'}`);
    console.log(`  Scheme Code: ${meta.schemeCode || 'N/A'}`);
    console.log(`  Category: ${meta.category || 'N/A'}\n`);

    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Show first 5 entries
    console.log('📈 First 5 NAV entries:');
    for (let i = 0; i < Math.min(5, sortedData.length); i++) {
      const entry = sortedData[i];
      console.log(`  ${entry.date}: ₹${entry.nav}`);
    }

    console.log('\n📉 Last 5 NAV entries:');
    for (let i = Math.max(0, sortedData.length - 5); i < sortedData.length; i++) {
      const entry = sortedData[i];
      console.log(`  ${entry.date}: ₹${entry.nav}`);
    }

    // Calculate 3-year CAGR
    const now = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    let startIndex = 0;
    for (let i = sortedData.length - 1; i >= 0; i--) {
      if (new Date(sortedData[i].date) <= threeYearsAgo) {
        startIndex = i;
        break;
      }
    }

    if (startIndex < sortedData.length - 1) {
      const startNav = parseFloat(sortedData[startIndex].nav);
      const endNav = parseFloat(sortedData[sortedData.length - 1].nav);
      const startDate = new Date(sortedData[startIndex].date);
      const endDate = new Date(sortedData[sortedData.length - 1].date);
      const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);

      const cagr = (Math.pow(endNav / startNav, 1 / years) - 1) * 100;

      console.log(`\n💰 3-Year Performance:`);
      console.log(`  Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
      console.log(`  Starting NAV: ₹${startNav.toFixed(2)}`);
      console.log(`  Ending NAV: ₹${endNav.toFixed(2)}`);
      console.log(`  3-Year CAGR: ${cagr.toFixed(2)}%`);
    }

    console.log('\n✅ Data layer test passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function testMFSearch() {
  console.log('\n🧪 Testing Mutual Fund search...\n');

  try {
    console.log('📡 Searching for "Bandhan Small Cap"...');
    const response = await axios.get(`${MFAPI_BASE}/mf/search?q=Bandhan`);

    if (!response.data || response.data.length === 0) {
      console.log('⚠️  No results found');
      return;
    }

    console.log(`✅ Found ${response.data.length} results\n`);

    // Show first 5 results
    for (let i = 0; i < Math.min(5, response.data.length); i++) {
      const fund = response.data[i];
      console.log(`  ${fund.schemeName} (Code: ${fund.schemeCode})`);
    }

    console.log('\n✅ Search test passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

(async () => {
  await testMFDataFetch();
  await testMFSearch();
})();
