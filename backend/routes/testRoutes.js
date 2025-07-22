const express = require('express');
const TypingTest = require('../models/TypingTest');
const TextContent = require('../models/TextContent');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get random text for typing test
router.get('/text', async (req, res) => {
  try {
    const { category, difficulty, language, wordCount } = req.query;
    
    const criteria = { isActive: true };
    if (category && category !== 'all') criteria.category = category;
    if (difficulty && difficulty !== 'all') criteria.difficulty = difficulty;
    if (language && language !== 'all') criteria.language = language;

    // If wordCount is specified, try to find texts within range
    if (wordCount) {
      const targetWords = parseInt(wordCount);
      criteria.wordCount = { $gte: targetWords - 10, $lte: targetWords + 20 };
    }

    let texts = await TextContent.getRandomText(criteria);
    
    // If no texts found with word count criteria, try without it
    if (texts.length === 0 && wordCount) {
      delete criteria.wordCount;
      texts = await TextContent.getRandomText(criteria);
    }
    
    if (texts.length === 0) {
      // Enhanced fallback texts organized by difficulty
      const fallbackTexts = {
        easy: [
          "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.",
          "Cats and dogs are popular pets. They bring joy and love to many families around the world.",
          "Reading books opens new worlds of knowledge and imagination. It is a wonderful way to spend time.",
          "The sun rises in the east and sets in the west. This happens every single day.",
          "Music has the power to bring people together. It can make us happy, sad, or excited."
        ],
        medium: [
          "Programming is not about typing, it's about thinking. Speed comes with practice and understanding of algorithms.",
          "Technology continues to evolve at an unprecedented rate, transforming how we communicate, work, and live our daily lives.",
          "Climate change presents significant challenges that require innovative solutions and global cooperation among nations.",
          "The internet has revolutionized access to information, enabling instant communication and learning opportunities worldwide.",
          "Artificial intelligence and machine learning are reshaping industries and creating new possibilities for automation."
        ],
        hard: [
          "The philosophical implications of consciousness and artificial intelligence continue to challenge our fundamental understanding of cognition, sentience, and the nature of existence itself.",
          "Quantum entanglement demonstrates the interconnectedness of particles across vast distances, fundamentally challenging our conventional understanding of locality, causality, and the deterministic nature of reality.",
          "Biotechnology advancements in CRISPR gene editing, personalized medicine, and synthetic biology are revolutionizing healthcare while simultaneously raising complex ethical questions about human enhancement and genetic modification.",
          "The intersection of neuroscience and technology through brain-computer interfaces promises unprecedented capabilities for treating neurological disorders while potentially transforming human cognitive abilities.",
          "Sustainable development requires balancing economic growth, environmental conservation, and social equity through innovative approaches that address climate change, resource depletion, and global inequality."
        ]
      };
      
      const requestedDifficulty = difficulty || 'medium';
      const availableTexts = fallbackTexts[requestedDifficulty] || fallbackTexts.medium;
      const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
      
      return res.json({
        text: {
          content: randomText,
          title: `${requestedDifficulty.charAt(0).toUpperCase() + requestedDifficulty.slice(1)} Practice Text`,
          category: 'default',
          difficulty: requestedDifficulty,
          wordCount: randomText.split(' ').length,
          characterCount: randomText.length,
          source: 'Built-in Practice Text'
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

// Get available categories and difficulties
router.get('/options', async (req, res) => {
  try {
    const options = await TextContent.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          difficulties: { $addToSet: '$difficulty' },
          languages: { $addToSet: '$language' }
        }
      }
    ]);

    const result = options[0] || {
      categories: ['quotes', 'literature', 'programming', 'common-words'],
      difficulties: ['easy', 'medium', 'hard'],
      languages: ['english']
    };

    res.json({
      categories: result.categories.sort(),
      difficulties: result.difficulties.sort(),
      languages: result.languages.sort(),
      message: 'Options retrieved successfully'
    });
  } catch (error) {
    console.error('Options retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve options',
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
