// Comprehensive CORS and Routing Test Script
// Run this in Node.js or browser console to test the API

const API_BASE_URL = 'https://monkey-type-clone-spicez.onrender.com/api';
const FRONTEND_ORIGIN = 'https://monkey-type-clone-s-pice-z.vercel.app';

console.log('🧪 Starting comprehensive API test...\n');

async function testAPI() {
  const tests = [];

  // Test 1: Health check (no CORS needed)
  console.log('1️⃣ Testing health endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health check passed');
      console.log(`   📊 Data:`, data);
    } else {
      console.log('   ❌ Health check failed');
    }
    tests.push({ name: 'Health Check', passed: response.ok });
  } catch (error) {
    console.log(`   ❌ Health check error: ${error.message}`);
    tests.push({ name: 'Health Check', passed: false });
  }

  console.log('\n2️⃣ Testing preflight OPTIONS request...');
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`   Allow-Headers: ${response.headers.get('Access-Control-Allow-Headers')}`);
    
    const passed = response.status === 200 && response.headers.get('Access-Control-Allow-Origin');
    console.log(`   ${passed ? '✅' : '❌'} Preflight ${passed ? 'passed' : 'failed'}`);
    tests.push({ name: 'Preflight OPTIONS', passed });
  } catch (error) {
    console.log(`   ❌ Preflight error: ${error.message}`);
    tests.push({ name: 'Preflight OPTIONS', passed: false });
  }

  console.log('\n3️⃣ Testing debug endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/test`, {
      headers: {
        'Origin': FRONTEND_ORIGIN
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Debug endpoint passed');
    } else {
      console.log('   ❌ Debug endpoint failed');
    }
    tests.push({ name: 'Debug Endpoint', passed: response.ok });
  } catch (error) {
    console.log(`   ❌ Debug endpoint error: ${error.message}`);
    tests.push({ name: 'Debug Endpoint', passed: false });
  }

  console.log('\n4️⃣ Testing login test endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/users/login-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Login test endpoint passed');
      console.log(`   📊 Data:`, data);
    } else {
      console.log('   ❌ Login test endpoint failed');
    }
    tests.push({ name: 'Login Test Endpoint', passed: response.ok });
  } catch (error) {
    console.log(`   ❌ Login test endpoint error: ${error.message}`);
    tests.push({ name: 'Login Test Endpoint', passed: false });
  }

  console.log('\n5️⃣ Testing actual login endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      },
      body: JSON.stringify({
        login: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS headers: ${response.headers.get('Access-Control-Allow-Origin')}`);
    
    // Login should return 401 for wrong credentials, not 404
    const passed = response.status !== 404;
    console.log(`   ${passed ? '✅' : '❌'} Login endpoint ${passed ? 'reachable' : 'not found'}`);
    
    if (response.ok || response.status === 401) {
      const data = await response.json();
      console.log(`   📊 Response:`, data);
    }
    tests.push({ name: 'Login Endpoint Reachable', passed });
  } catch (error) {
    console.log(`   ❌ Login endpoint error: ${error.message}`);
    tests.push({ name: 'Login Endpoint Reachable', passed: false });
  }

  // Summary
  console.log('\n📋 Test Summary:');
  tests.forEach(test => {
    console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
  });

  const allPassed = tests.every(test => test.passed);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED! 🎉' : 'SOME TESTS FAILED ❌'}`);

  if (!allPassed) {
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check Render service logs');
    console.log('2. Verify backend is deployed and running');
    console.log('3. Check environment variables in Render');
    console.log('4. Verify API routes are registered correctly');
  }
}

// Run the test
testAPI().catch(console.error);
