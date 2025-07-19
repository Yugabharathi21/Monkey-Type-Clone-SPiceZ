// API Test Script - Run this in browser console to test API connectivity
// Or save as test-api.html and open in browser

console.log('🧪 Testing API Connection...');

const API_BASE_URL = 'https://monkey-type-clone-spicez.onrender.com/api';

async function testAPI() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('Health Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health Check:', healthData);
    } else {
      console.log('❌ Health check failed');
    }

    console.log('\nTesting login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    console.log('Login Headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.ok) {
      console.log('✅ Login endpoint accessible');
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login response:', errorText);
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
    console.log('Check:');
    console.log('1. Backend server is running');
    console.log('2. CORS is properly configured');
    console.log('3. Network connectivity');
  }
}

testAPI();
