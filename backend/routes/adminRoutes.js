const express = require('express');
const TypingTest = require('../models/TypingTest');
const TextContent = require('../models/TextContent');
const User = require('../models/User');

const router = express.Router();

// Seed database with sample data
router.post('/seed', async (req, res) => {
  try {
    // Check if already seeded
    const existingTexts = await TextContent.countDocuments();
    if (existingTexts > 0) {
      return res.status(400).json({
        error: 'Already seeded',
        message: 'Database already contains text content',
      });
    }

    // Sample texts to seed
    const sampleTexts = [
      {
        title: 'Quick Brown Fox',
        content: 'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.',
        category: 'common-words',
        difficulty: 'easy',
        author: 'Traditional',
        tags: ['pangram', 'alphabet', 'practice'],
      },
      {
        title: 'Programming Wisdom',
        content: 'Programming is not about typing, it is about thinking. Speed comes with practice and understanding the fundamentals.',
        category: 'programming',
        difficulty: 'medium',
        tags: ['programming', 'wisdom', 'practice'],
      },
      {
        title: 'Typing Mastery',
        content: 'Type like the wind, think like the storm. Every keystroke brings you closer to mastery and excellence.',
        category: 'quotes',
        difficulty: 'medium',
        tags: ['motivation', 'typing', 'mastery'],
      },
      {
        title: 'Shakespeare Quote',
        content: 'To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.',
        category: 'literature',
        difficulty: 'hard',
        author: 'William Shakespeare',
        source: 'Hamlet',
        tags: ['shakespeare', 'classic', 'literature'],
      },
      {
        title: 'Code Comments',
        content: 'Good code is its own best documentation. As you are about to add a comment, ask yourself if you can improve the code.',
        category: 'programming',
        difficulty: 'medium',
        tags: ['programming', 'documentation', 'best-practices'],
      },
      {
        title: 'Practice Makes Perfect',
        content: 'Practice makes perfect, but perfect practice makes champions. Focus on accuracy first, speed will naturally follow.',
        category: 'quotes',
        difficulty: 'easy',
        tags: ['practice', 'motivation', 'improvement'],
      },
      {
        title: 'Keyboard Symphony',
        content: 'In the world of keyboards and screens, precision and speed dance together in perfect harmony.',
        category: 'quotes',
        difficulty: 'medium',
        tags: ['typing', 'precision', 'harmony'],
      },
      {
        title: 'Algorithm Complexity',
        content: 'Understanding time and space complexity is crucial for writing efficient algorithms and optimal data structures.',
        category: 'programming',
        difficulty: 'hard',
        tags: ['algorithms', 'complexity', 'efficiency'],
      }
    ];

    // Insert sample texts
    const insertedTexts = await TextContent.insertMany(sampleTexts);

    res.status(201).json({
      message: 'Database seeded successfully',
      insertedCount: insertedTexts.length,
      texts: insertedTexts,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      error: 'Seeding failed',
      message: error.message,
    });
  }
});

// Reset database (WARNING: This will delete all data)
router.post('/reset', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({
        error: 'Confirmation required',
        message: 'Please provide confirm: "DELETE_ALL_DATA" to reset database',
      });
    }

    // Delete all collections
    await User.deleteMany({});
    await TypingTest.deleteMany({});
    await TextContent.deleteMany({});

    res.json({
      message: 'Database reset successfully',
      warning: 'All data has been deleted',
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: error.message,
    });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments({ isActive: true });
    const testCount = await TypingTest.countDocuments();
    const textCount = await TextContent.countDocuments({ isActive: true });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isActive: true,
    });

    const recentTests = await TypingTest.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      database: {
        totalUsers: userCount,
        totalTests: testCount,
        totalTexts: textCount,
        recentUsers: recentUsers,
        recentTests: recentTests,
      },
      message: 'Database statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message,
    });
  }
});

module.exports = router;
