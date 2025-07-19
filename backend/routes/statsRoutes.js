const express = require('express');
const TypingTest = require('../models/TypingTest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's detailed statistics
router.get('/user', auth, async (req, res) => {
  try {
    const { timeframe = 'all', groupBy = 'day' } = req.query;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    // Build time filter
    const matchCondition = { user: req.userId, isCompleted: true };
    
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        matchCondition.createdAt = { $gte: startDate };
      }
    }

    // Aggregate statistics
    const stats = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          bestWPM: { $max: '$results.wpm' },
          bestAccuracy: { $max: '$results.accuracy' },
          totalTimeTyped: { $sum: '$results.timeElapsed' },
          totalCharacters: { $sum: '$results.totalCharacters' },
          totalCorrectCharacters: { $sum: '$results.correctCharacters' },
        }
      }
    ]);

    // Get progress over time
    let groupByFormat;
    switch (groupBy) {
      case 'hour':
        groupByFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
        break;
      case 'day':
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupByFormat = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
        break;
      case 'month':
        groupByFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const progressData = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupByFormat,
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          testCount: { $sum: 1 },
          bestWPM: { $max: '$results.wpm' },
          date: { $first: '$createdAt' },
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get recent tests
    const recentTests = await TypingTest.find(matchCondition)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('results createdAt testConfig');

    // Calculate consistency score
    const wpmValues = recentTests.map(test => test.results.wpm);
    let consistencyScore = 0;
    if (wpmValues.length > 1) {
      const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
      const standardDeviation = Math.sqrt(variance);
      consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    }

    res.json({
      stats: stats[0] || {
        totalTests: 0,
        averageWPM: 0,
        averageAccuracy: 0,
        bestWPM: 0,
        bestAccuracy: 0,
        totalTimeTyped: 0,
        totalCharacters: 0,
        totalCorrectCharacters: 0,
      },
      progressData,
      recentTests,
      consistencyScore: Math.round(consistencyScore),
      userStats: user.stats,
      achievements: user.achievements,
      message: 'Statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message,
    });
  }
});

// Get global statistics
router.get('/global', async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    
    const matchCondition = { isCompleted: true, isPublic: true };
    
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      if (startDate) {
        matchCondition.createdAt = { $gte: startDate };
      }
    }

    const globalStats = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          highestWPM: { $max: '$results.wpm' },
          highestAccuracy: { $max: '$results.accuracy' },
          totalUsersCount: { $addToSet: '$user' },
        }
      },
      {
        $project: {
          totalTests: 1,
          averageWPM: { $round: ['$averageWPM', 2] },
          averageAccuracy: { $round: ['$averageAccuracy', 2] },
          highestWPM: 1,
          highestAccuracy: 1,
          totalUsers: { $size: '$totalUsersCount' },
        }
      }
    ]);

    // Get WPM distribution
    const wpmDistribution = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $bucket: {
          groupBy: '$results.wpm',
          boundaries: [0, 20, 40, 60, 80, 100, 120, 150, 200],
          default: '200+',
          output: {
            count: { $sum: 1 },
            range: { $push: '$results.wpm' },
          }
        }
      }
    ]);

    // Get accuracy distribution
    const accuracyDistribution = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $bucket: {
          groupBy: '$results.accuracy',
          boundaries: [0, 70, 80, 85, 90, 95, 98, 100],
          default: '100',
          output: {
            count: { $sum: 1 },
          }
        }
      }
    ]);

    res.json({
      globalStats: globalStats[0] || {
        totalTests: 0,
        averageWPM: 0,
        averageAccuracy: 0,
        highestWPM: 0,
        highestAccuracy: 0,
        totalUsers: 0,
      },
      wpmDistribution,
      accuracyDistribution,
      message: 'Global statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Global stats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve global statistics',
      message: error.message,
    });
  }
});

// Compare user stats with global averages
router.get('/compare', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    // Get user's recent performance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userRecentStats = await TypingTest.aggregate([
      {
        $match: {
          user: user._id,
          isCompleted: true,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          testCount: { $sum: 1 },
        }
      }
    ]);

    // Get global averages for comparison
    const globalAverages = await TypingTest.aggregate([
      {
        $match: {
          isCompleted: true,
          isPublic: true,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
        }
      }
    ]);

    const userStats = userRecentStats[0] || { averageWPM: 0, averageAccuracy: 0, testCount: 0 };
    const globalStats = globalAverages[0] || { averageWPM: 0, averageAccuracy: 0 };

    // Calculate percentiles
    const wpmPercentile = await TypingTest.aggregate([
      {
        $match: {
          isCompleted: true,
          isPublic: true,
          'results.wpm': { $lte: userStats.averageWPM }
        }
      },
      { $count: 'count' }
    ]);

    const totalTests = await TypingTest.countDocuments({
      isCompleted: true,
      isPublic: true
    });

    const wpmPercentileRank = totalTests > 0 
      ? Math.round((wpmPercentile[0]?.count || 0) / totalTests * 100)
      : 0;

    res.json({
      userStats: {
        ...userStats,
        bestWPM: user.stats.bestWPM,
        bestAccuracy: user.stats.bestAccuracy,
      },
      globalStats,
      comparison: {
        wpmDifference: Math.round((userStats.averageWPM - globalStats.averageWPM) * 100) / 100,
        accuracyDifference: Math.round((userStats.averageAccuracy - globalStats.averageAccuracy) * 100) / 100,
        wpmPercentile: wpmPercentileRank,
      },
      message: 'Comparison statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Comparison stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve comparison statistics',
      message: error.message,
    });
  }
});

module.exports = router;
