// Test script to verify database connection and typing test submission

const API_BASE_URL = 'http://localhost:5000/api';

async function testTypingTestSubmission() {
  console.log('🧪 Testing typing test submission...');
  
  try {
    // Test data for submission
    const testData = {
      testConfig: {
        textType: 'random',
        difficulty: 'medium',
        duration: 60,
        language: 'english',
      },
      testContent: {
        originalText: 'The quick brown fox jumps over the lazy dog.',
        textSource: 'default',
        textId: null,
      },
      results: {
        wpm: 45,
        accuracy: 95,
        timeElapsed: 60,
        totalCharacters: 44,
        correctCharacters: 42,
        incorrectCharacters: 2,
      },
      keystrokeData: [],
      wpmHistory: [
        { timestamp: Date.now() - 30000, wpm: 30 },
        { timestamp: Date.now() - 20000, wpm: 35 },
        { timestamp: Date.now() - 10000, wpm: 40 },
        { timestamp: Date.now(), wpm: 45 }
      ],
      accuracyHistory: [
        { timestamp: Date.now() - 30000, accuracy: 90 },
        { timestamp: Date.now() - 20000, accuracy: 92 },
        { timestamp: Date.now() - 10000, accuracy: 94 },
        { timestamp: Date.now(), accuracy: 95 }
      ],
      metadata: {
        userAgent: 'Test Script',
        timestamp: new Date().toISOString(),
      },
      isCompleted: true,
      isGuest: true,
      guestId: `test_guest_${Date.now()}`,
    };

    const response = await fetch(`${API_BASE_URL}/tests/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test submission successful!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Test submission failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during test submission:', error.message);
    return false;
  }
}

async function testStatisticsRetrieval() {
  console.log('📈 Testing statistics retrieval...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stats/global`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Statistics retrieval successful!');
      console.log('📈 Global Stats:', JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Statistics retrieval failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during statistics retrieval:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting database connection tests...\n');
  
  const results = {};
  
  // Test typing test submission
  results.submission = await testTypingTestSubmission();
  console.log('');
  
  // Test statistics retrieval
  results.statistics = await testStatisticsRetrieval();
  console.log('');
  
  // Summary
  console.log('📋 Test Summary:');
  console.log(`✅ Typing Test Submission: ${results.submission ? 'PASSED' : 'FAILED'}`);
  console.log(`📈 Statistics Retrieval: ${results.statistics ? 'PASSED' : 'FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED! 🎉' : 'SOME TESTS FAILED ❌'}`);
}

// Run the tests
runTests().catch(console.error);
