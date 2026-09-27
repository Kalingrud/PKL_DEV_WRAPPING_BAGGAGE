/**
 * Simple Debug Script untuk Cross-Day Shift
 * Script sederhana untuk testing manual dengan berbagai waktu
 */

const axios = require('axios');

// Konfigurasi (sesuaikan dengan setup Anda)
const config = {
  apiUrl: 'http://localhost:3000/api/lingga_trx', // Sesuaikan URL dan endpoint
  testData: {
    TrxType: 1,
    Termcode: 'TERM001',
    ShiftCode: 'Shift 02', // Ganti dengan shift yang ingin ditest
    LoginCode: 'testuser',
    EngineCode: 1,
    qty: 1,
    QRCode: `DEBUG_${Date.now()}`,
    pack_type: 'KK',
    payment_type: 'cash',
    payment_reff: 'DEBUG_REF',
    parent_code: `DEBUG_PC_${Date.now()}`,
    end_trx: 'n'
  }
};

/**
 * Test dengan waktu tertentu
 * @param {number} hour - Jam (0-23)
 * @param {number} minute - Menit (0-59)
 */
async function testWithTime(hour, minute) {
  console.log(`\n🧪 Testing with current time: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  console.log('📝 Note: This test uses current server time.');
  console.log('📝 To test specific time scenarios manually, wait for the appropriate time or modify server system time.');
  
  try {
    const response = await axios.post(config.apiUrl, config.testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response Status:', response.status);
    
    if (response.data && response.data.data) {
      console.log('📊 Transaction Data:', response.data.data);
    }
    
    console.log('🔍 Check server logs above for cross-day detection details');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test scenarios untuk Shift 02
 */
async function testShift02Scenarios() {
  console.log('🚀 Testing Shift 02 Cross-Day Scenarios\n');
  
  // Test cases untuk Shift 02 (crossing day: 20:00-07:59)
  const testCases = [
    { hour: 20, minute: 0, desc: "Start of Shift 02 (evening)" },
    { hour: 23, minute: 30, desc: "Late night Shift 02" },
    { hour: 0, minute: 30, desc: "Early morning - should use previous day date" },
    { hour: 2, minute: 0, desc: "Early morning 2AM - should use previous day date" },
    { hour: 7, minute: 30, desc: "End of Shift 02 - should use previous day date" },
    { hour: 8, minute: 0, desc: "After Shift 02 - normal current day" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.desc} ---`);
    await testWithTime(testCase.hour, testCase.minute);
    
    // Delay antar test
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Test scenarios untuk Shift 01 (non-crossing day)
 */
async function testShift01Scenarios() {
  console.log('\n🚀 Testing Shift 01 Normal Scenarios\n');
  
  // Update shift code untuk Shift 01
  const originalShiftCode = config.testData.ShiftCode;
  config.testData.ShiftCode = 'Shift 01';
  
  const testCases = [
    { hour: 8, minute: 0, desc: "Start of Shift 01" },
    { hour: 15, minute: 30, desc: "Middle of Shift 01" },
    { hour: 19, minute: 30, desc: "End of Shift 01" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.desc} ---`);
    await testWithTime(testCase.hour, testCase.minute);
    
    // Delay antar test
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Restore original shift code
  config.testData.ShiftCode = originalShiftCode;
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    // Manual testing dengan jam dan menit tertentu
    const hour = parseInt(args[0]);
    const minute = parseInt(args[1]);
    
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.log('❌ Invalid time format. Use: node debug-shift-simple.js <hour> <minute>');
      console.log('   Example: node debug-shift-simple.js 2 30');
      process.exit(1);
    }
    
    testWithTime(hour, minute);
    
  } else if (args[0] === 'shift01') {
    // Test Shift 01 scenarios
    testShift01Scenarios();
    
  } else if (args[0] === 'shift02') {
    // Test Shift 02 scenarios
    testShift02Scenarios();
    
  } else {
    // Default: test semua scenarios
    console.log('🎯 Cross-Day Shift Debug Tool');
    console.log('\nUsage:');
    console.log('  node debug-shift-simple.js                    # Test all scenarios');
    console.log('  node debug-shift-simple.js shift01            # Test Shift 01 only');
    console.log('  node debug-shift-simple.js shift02            # Test Shift 02 only');
    console.log('  node debug-shift-simple.js <hour> <minute>    # Test specific time');
    console.log('\nExamples:');
    console.log('  node debug-shift-simple.js 2 30              # Test at 2:30 AM');
    console.log('  node debug-shift-simple.js 23 45             # Test at 11:45 PM');
    
    // Run default test scenarios
    testShift02Scenarios().then(() => {
      console.log('\n✅ Debug testing completed!');
      console.log('\n📋 Check server console logs for detailed debugging information:');
      console.log('   - Look for "=== DEBUG: CROSS-DAY SHIFT ANALYSIS ==="');
      console.log('   - Look for "=== DEBUG: FINAL DATE VALUES ==="');
    });
  }
}

module.exports = {
  testWithTime,
  testShift02Scenarios,
  testShift01Scenarios
};
