/**
 * Script untuk testing Cross-Day Shift Logic
 * Gunakan script ini untuk menguji berbagai skenario waktu
 */

const axios = require('axios');

// Konfigurasi testing
const API_BASE_URL = 'http://localhost:3000'; // Sesuaikan dengan URL API Anda
const ENDPOINT = '/api/lingga_trx'; // Sesuaikan dengan endpoint yang benar

// Sample request data untuk testing
const getTestRequestData = (customTime = null) => {
  const now = customTime ? new Date(customTime) : new Date();
  
  return {
    TrxType: 1,
    Termcode: 'TERM001', // Sesuaikan dengan data yang ada
    ShiftCode: 'Shift 02', // Testing dengan Shift 02 yang crossing day
    LoginCode: 'testuser', // Sesuaikan dengan data yang ada
    EngineCode: 1,
    qty: 1,
    QRCode: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    pack_type: 'KK',
    payment_type: 'cash',
    payment_reff: 'TEST_REF',
    parent_code: `TEST_PC_${Date.now()}`,
    end_trx: 'n'
  };
};

// Test scenarios
const testScenarios = [
  {
    name: 'Test 1: Shift 02 - Early Morning (02:00)',
    description: 'Transaksi pada jam 02:00 seharusnya menggunakan shift_date hari sebelumnya',
    time: new Date().setHours(2, 0, 0, 0) // Jam 02:00 hari ini
  },
  {
    name: 'Test 2: Shift 02 - Late Night (22:00)', 
    description: 'Transaksi pada jam 22:00 seharusnya menggunakan shift_date hari yang sama',
    time: new Date().setHours(22, 0, 0, 0) // Jam 22:00 hari ini
  },
  {
    name: 'Test 3: Shift 02 - Early Morning (07:30)',
    description: 'Transaksi pada jam 07:30 masih dalam range shift hari sebelumnya',
    time: new Date().setHours(7, 30, 0, 0) // Jam 07:30 hari ini
  },
  {
    name: 'Test 4: Shift 01 - Normal Time (10:00)',
    description: 'Transaksi Shift 01 pada jam normal, tidak ada crossing day',
    time: new Date().setHours(10, 0, 0, 0), // Jam 10:00 hari ini
    shiftCode: 'Shift 01'
  }
];

// Function untuk menjalankan test
async function runTest(scenario) {
  console.log(`\n🧪 ${scenario.name}`);
  console.log(`📝 ${scenario.description}`);
  console.log(`⏰ Test time: ${new Date(scenario.time).toLocaleString('id-ID')}`);
  
  try {
    const testData = getTestRequestData(scenario.time);
    
    // Override shift code jika ada
    if (scenario.shiftCode) {
      testData.ShiftCode = scenario.shiftCode;
    }
    
    console.log('📤 Sending request with data:', {
      ShiftCode: testData.ShiftCode,
      QRCode: testData.QRCode,
      TestTime: new Date(scenario.time).toISOString()
    });
    
    const response = await axios.post(`${API_BASE_URL}${ENDPOINT}`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('📋 Response Data:', response.data);
    
    // Cek apakah ada cross-day detection
    console.log('🔍 Check console logs above for cross-day detection details');
    
  } catch (error) {
    console.log('❌ Test Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Function untuk menjalankan semua test
async function runAllTests() {
  console.log('🚀 Starting Cross-Day Shift Testing...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('🔗 Endpoint:', ENDPOINT);
  
  for (const scenario of testScenarios) {
    await runTest(scenario);
    
    // Delay antar request
    console.log('⏳ Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📊 Check your console logs for detailed debugging information.');
  console.log('🔍 Look for these debug markers:');
  console.log('   - "=== DEBUG: CROSS-DAY SHIFT ANALYSIS ==="');
  console.log('   - "=== DEBUG: FINAL DATE VALUES ==="');
}

// Manual test function untuk waktu tertentu
async function testSpecificTime(year, month, day, hour, minute) {
  const testTime = new Date(year, month - 1, day, hour, minute, 0, 0);
  
  console.log(`\n🎯 Manual Test for specific time: ${testTime.toLocaleString('id-ID')}`);
  
  const scenario = {
    name: `Manual Test: ${testTime.toLocaleString('id-ID')}`,
    description: 'Manual test for specific time',
    time: testTime.getTime(),
    shiftCode: 'Shift 02'
  };
  
  await runTest(scenario);
}

// Export functions untuk digunakan secara manual
module.exports = {
  runAllTests,
  testSpecificTime,
  testScenarios
};

// Jika script dijalankan langsung
if (require.main === module) {
  runAllTests().catch(console.error);
}
