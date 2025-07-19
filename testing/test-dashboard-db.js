// Test script to verify Dashboard database integration for current user
console.log('🧪 Testing Dashboard Database Integration for Current User...\n');

async function testUserAuthentication() {
  console.log('🔐 Testing User Authentication...');
  
  // Generate consistent timestamp for username and email
  const timestamp = Date.now().toString().slice(-8);
  
  try {
    // First try to register a test user
    const registerResponse = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `test_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      }),
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User registration successful');
      return registerData.token;
    } else {
      console.log('ℹ️  Registration failed, trying login instead...');
      
      // Try login with existing user
      const loginResponse = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: 'admin@example.com', // fallback user
          password: 'password123',
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ User login successful');
        return loginData.token;
      } else {
        console.log('❌ Authentication failed');
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return null;
  }
}

async function testUserProfile(token) {
  console.log('👤 Testing User Profile Retrieval...');
  
  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ User profile retrieved successfully');
      console.log('📊 Profile data:', {
        username: data.user.username,
        email: data.user.email,
        profileName: `${data.user.profile?.firstName || ''} ${data.user.profile?.lastName || ''}`.trim(),
        totalTests: data.user.stats?.totalTests || 0,
        bestWPM: data.user.stats?.bestWPM || 0
      });
      return data.user;
    } else {
      const error = await response.json();
      console.log('❌ Profile retrieval failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Profile retrieval error:', error.message);
    return null;
  }
}

async function testUserStatistics(token) {
  console.log('📈 Testing User Statistics Retrieval...');
  
  try {
    const response = await fetch('http://localhost:5000/api/stats/user?timeframe=all&groupBy=day', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ User statistics retrieved successfully');
      console.log('📊 Statistics data:', {
        totalTests: data.stats?.totalTests || 0,
        averageWPM: Math.round(data.stats?.averageWPM || 0),
        averageAccuracy: Math.round(data.stats?.averageAccuracy || 0),
        bestWPM: data.stats?.bestWPM || 0,
        recentTestsCount: data.recentTests?.length || 0,
        progressDataPoints: data.progressData?.length || 0
      });
      return data;
    } else {
      const error = await response.json();
      console.log('❌ Statistics retrieval failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Statistics retrieval error:', error.message);
    return null;
  }
}

async function submitTestData(token) {
  console.log('💾 Testing Test Data Submission...');
  
  try {
    const testData = {
      testConfig: {
        textType: 'random',
        difficulty: 'medium',
        duration: 60,
        language: 'english',
      },
      testContent: {
        originalText: 'This is a test sentence for dashboard verification.',
        textSource: 'default',
        textId: null,
      },
      results: {
        wpm: 65,
        accuracy: 96,
        timeElapsed: 45,
        totalCharacters: 48,
        correctCharacters: 46,
        incorrectCharacters: 2,
      },
      keystrokeData: [],
      wpmHistory: [
        { timestamp: Date.now() - 30000, wpm: 55 },
        { timestamp: Date.now() - 15000, wpm: 60 },
        { timestamp: Date.now(), wpm: 65 }
      ],
      accuracyHistory: [
        { timestamp: Date.now() - 30000, accuracy: 92 },
        { timestamp: Date.now() - 15000, accuracy: 94 },
        { timestamp: Date.now(), accuracy: 96 }
      ],
      metadata: {
        userAgent: 'Dashboard Test Script',
        timestamp: new Date().toISOString(),
      },
      isCompleted: true,
    };

    const response = await fetch('http://localhost:5000/api/tests/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test data submitted successfully');
      console.log('📝 Test ID:', result.testId);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Test submission failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test submission error:', error.message);
    return false;
  }
}

async function runDashboardTests() {
  console.log('🚀 Starting Dashboard Database Integration Tests...\n');
  
  const results = {};
  
  // Test user authentication
  const token = await testUserAuthentication();
  results.authentication = !!token;
  console.log('');
  
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  // Test user profile retrieval
  const userProfile = await testUserProfile(token);
  results.profile = !!userProfile;
  console.log('');
  
  // Test user statistics retrieval
  const userStats = await testUserStatistics(token);
  results.statistics = !!userStats;
  console.log('');
  
  // Submit a test to have some data
  results.testSubmission = await submitTestData(token);
  console.log('');
  
  // Test statistics again after submission
  if (results.testSubmission) {
    console.log('🔄 Re-testing statistics after data submission...');
    const updatedStats = await testUserStatistics(token);
    results.updatedStatistics = !!updatedStats;
    console.log('');
  }
  
  // Summary
  console.log('📋 Dashboard Integration Test Summary:');
  console.log(`🔐 Authentication: ${results.authentication ? 'PASSED' : 'FAILED'}`);
  console.log(`👤 Profile Retrieval: ${results.profile ? 'PASSED' : 'FAILED'}`);
  console.log(`📈 Statistics Retrieval: ${results.statistics ? 'PASSED' : 'FAILED'}`);
  console.log(`💾 Test Data Submission: ${results.testSubmission ? 'PASSED' : 'FAILED'}`);
  console.log(`🔄 Updated Statistics: ${results.updatedStatistics ? 'PASSED' : 'FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n🎯 Overall Dashboard Integration: ${allPassed ? 'ALL TESTS PASSED! 🎉' : 'SOME TESTS FAILED ❌'}`);
  
  if (allPassed) {
    console.log('\n✅ Dashboard is successfully connected to the database and retrieving user-specific data!');
    console.log('🔧 Your typing test results will be saved and displayed in the dashboard.');
  }
}

// Run the tests
runDashboardTests().catch(console.error);
