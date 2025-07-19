const express = require('express');
const TypingTest = require('../models/TypingTest');
const TextContent = require('../models/TextContent');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get random text for typing test
router.get('/text', async (req, res) => {
  try {
    const { category, difficulty, language } = req.query;
    
    const criteria = {};
    if (category) criteria.category = category;
    if (difficulty) criteria.difficulty = difficulty;
    if (language) criteria.language = language;

    const texts = await TextContent.getRandomText(criteria);
    
    if (texts.length === 0) {
      // Fallback to default texts if no custom texts found
      const defaultTexts = [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.",
        "Programming is not about typing, it's about thinking. Speed comes with practice and understanding.",
        "Type like the wind, think like the storm. Every keystroke brings you closer to mastery.",
        "In the world of keyboards and screens, precision and speed dance together in perfect harmony.",
        "Practice makes perfect, but perfect practice makes champions. Focus on accuracy first, speed will follow."
      ];
      
      const randomText = defaultTexts[Math.floor(Math.random() * defaultTexts.length)];
      
      return res.json({
        text: {
          content: randomText,
          title: 'Default Practice Text',
          category: 'default',
          difficulty: 'medium',
          wordCount: randomText.split(' ').length,
        },
        message: 'Default text retrieved successfully',
      });
    }

    // Increment usage count for the selected text
    if (texts[0]._id) {
      await TextContent.findByIdAndUpdate(texts[0]._id, { $inc: { usageCount: 1 } });
    }

    res.json({
      text: texts[0],
      message: 'Text retrieved successfully',
    });
  } catch (error) {
    console.error('Text retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve text',
      message: error.message,
    });
  }
});

// Submit typing test result
router.post('/submit', async (req, res) => {
  try {
    const {
      testConfig,
      testContent,
      results,
      keystrokeData,
      wpmHistory,
      accuracyHistory,
      metadata,
      isGuest,
      guestId,
    } = req.body;

    // Validate required fields
    if (!results || !testContent) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Test results and content are required',
      });
    }

    // Create test record
    const testData = {
      testConfig,
      testContent,
      results,
      keystrokeData: keystrokeData || [],
      wpmHistory: wpmHistory || [],
      accuracyHistory: accuracyHistory || [],
      metadata: metadata || {},
      isGuest: isGuest || false,
    };

    // Handle user vs guest
    if (isGuest) {
      testData.guestId = guestId || `guest_${Date.now()}`;
    } else {
      // Check if user is authenticated
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          testData.user = decoded.userId;
        } catch (tokenError) {
          // If token is invalid, treat as guest
          testData.isGuest = true;
          testData.guestId = guestId || `guest_${Date.now()}`;
        }
      } else {
        testData.isGuest = true;
        testData.guestId = guestId || `guest_${Date.now()}`;
      }
    }

    const typingTest = new TypingTest(testData);
    await typingTest.save();

    // Update user stats if not a guest
    if (!testData.isGuest && testData.user) {
      try {
        const user = await User.findById(testData.user);
        if (user) {
          await user.updateStats(results);
          
          // Check for achievements
          await checkAndAwardAchievements(user, results);
        }
      } catch (userUpdateError) {
        console.error('Error updating user stats:', userUpdateError);
        // Don't fail the request if user update fails
      }
    }

    res.status(201).json({
      message: 'Test result submitted successfully',
      testId: typingTest._id,
      detailedStats: typingTest.getDetailedStats(),
    });
  } catch (error) {
    console.error('Test submission error:', error);
    res.status(500).json({
      error: 'Failed to submit test result',
      message: error.message,
    });
  }
});

// Get user's test history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const tests = await TypingTest.find({ user: req.userId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-keystrokeData'); // Exclude keystroke data for performance

    const total = await TypingTest.countDocuments({ user: req.userId });

    res.json({
      tests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: tests.length,
        totalRecords: total,
      },
      message: 'Test history retrieved successfully',
    });
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve test history',
      message: error.message,
    });
  }
});

// Get specific test details
router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await TypingTest.findById(testId)
      .populate('user', 'username profile.firstName profile.lastName');

    if (!test) {
      return res.status(404).json({
        error: 'Test not found',
        message: 'Typing test not found',
      });
    }

    // Check if user has permission to view this test
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (tokenError) {
        // Invalid token, proceed as guest
      }
    }

    // Allow access if: test is public, user owns the test, or user is viewing their own guest test
    const canView = test.isPublic || 
                   (test.user && test.user._id.toString() === userId) ||
                   (test.isGuest && req.query.guestId === test.guestId);

    if (!canView) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this test',
      });
    }

    res.json({
      test,
      detailedStats: test.getDetailedStats(),
      message: 'Test details retrieved successfully',
    });
  } catch (error) {
    console.error('Test retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve test details',
      message: error.message,
    });
  }
});

// Delete a test
router.delete('/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await TypingTest.findById(testId);
    if (!test) {
      return res.status(404).json({
        error: 'Test not found',
        message: 'Typing test not found',
      });
    }

    // Check if user owns the test
    if (test.user.toString() !== req.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own tests',
      });
    }

    await TypingTest.findByIdAndDelete(testId);

    res.json({
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('Test deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete test',
      message: error.message,
    });
  }
});

// Get test categories and difficulties
router.get('/meta/options', async (req, res) => {
  try {
    const categories = await TextContent.distinct('category', { isActive: true });
    const difficulties = await TextContent.distinct('difficulty', { isActive: true });
    const languages = await TextContent.distinct('language', { isActive: true });

    res.json({
      categories,
      difficulties,
      languages,
      message: 'Test options retrieved successfully',
    });
  } catch (error) {
    console.error('Options retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve test options',
      message: error.message,
    });
  }
});

// Achievement checking function
async function checkAndAwardAchievements(user, results) {
  const achievements = [];

  // First test achievement
  if (user.stats.totalTests === 1) {
    achievements.push({
      name: 'First Steps',
      description: 'Completed your first typing test',
      icon: '🎯',
    });
  }

  // Speed milestones
  if (results.wpm >= 100 && !user.achievements.find(a => a.name === 'Century Club')) {
    achievements.push({
      name: 'Century Club',
      description: 'Achieved 100+ WPM',
      icon: '💯',
    });
  }

  if (results.wpm >= 80 && !user.achievements.find(a => a.name === 'Speed Demon')) {
    achievements.push({
      name: 'Speed Demon',
      description: 'Achieved 80+ WPM',
      icon: '⚡',
    });
  }

  // Accuracy achievements
  if (results.accuracy >= 99 && !user.achievements.find(a => a.name === 'Perfectionist')) {
    achievements.push({
      name: 'Perfectionist',
      description: 'Achieved 99%+ accuracy',
      icon: '🎯',
    });
  }

  // Test count milestones
  if (user.stats.totalTests >= 100 && !user.achievements.find(a => a.name === 'Dedicated Typist')) {
    achievements.push({
      name: 'Dedicated Typist',
      description: 'Completed 100 typing tests',
      icon: '🏆',
    });
  }

  // Award achievements
  for (const achievement of achievements) {
    await user.addAchievement(achievement);
  }
}

module.exports = router;
