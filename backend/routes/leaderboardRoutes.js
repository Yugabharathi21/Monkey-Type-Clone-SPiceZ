const express = require('express');
const TypingTest = require('../models/TypingTest');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { 
      timeframe = 'all', 
      metric = 'wpm', 
      limit = 50,
      category = 'all' 
    } = req.query;

    const matchCondition = { 
      isCompleted: true, 
      isPublic: true 
    };

    // Add time filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'yearly':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        matchCondition.createdAt = { $gte: startDate };
      }
    }

    // Add category filter
    if (category !== 'all') {
      matchCondition['testConfig.textType'] = category;
    }

    let sortField, groupField;
    switch (metric) {
      case 'accuracy':
        sortField = { bestAccuracy: -1, bestWPM: -1 };
        groupField = { $max: '$results.accuracy' };
        break;
      case 'consistency':
        sortField = { consistencyScore: -1, bestWPM: -1 };
        groupField = { $avg: '$results.wpm' }; // We'll calculate consistency separately
        break;
      case 'tests':
        sortField = { totalTests: -1, bestWPM: -1 };
        groupField = { $sum: 1 };
        break;
      default: // wpm
        sortField = { bestWPM: -1, bestAccuracy: -1 };
        groupField = { $max: '$results.wpm' };
    }

    const aggregationPipeline = [
      { $match: matchCondition },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $match: {
          'userInfo.isActive': true
        }
      },
      {
        $group: {
          _id: '$user',
          username: { $first: '$userInfo.username' },
          profile: { $first: '$userInfo.profile' },
          bestWPM: { $max: '$results.wpm' },
          bestAccuracy: { $max: '$results.accuracy' },
          averageWPM: { $avg: '$results.wpm' },
          averageAccuracy: { $avg: '$results.accuracy' },
          totalTests: { $sum: 1 },
          recentTestDate: { $max: '$createdAt' },
          wpmValues: { $push: '$results.wpm' }, // For consistency calculation
        }
      }
    ];

    // Add consistency calculation if needed
    if (metric === 'consistency') {
      aggregationPipeline.push({
        $addFields: {
          consistencyScore: {
            $let: {
              vars: {
                mean: { $avg: '$wpmValues' },
                count: { $size: '$wpmValues' }
              },
              in: {
                $cond: {
                  if: { $gt: ['$$count', 1] },
                  then: {
                    $subtract: [
                      100,
                      {
                        $multiply: [
                          {
                            $divide: [
                              {
                                $sqrt: {
                                  $avg: {
                                    $map: {
                                      input: '$wpmValues',
                                      as: 'wpm',
                                      in: { $pow: [{ $subtract: ['$$wpm', '$$mean'] }, 2] }
                                    }
                                  }
                                }
                              },
                              '$$mean'
                            ]
                          },
                          100
                        ]
                      }
                    ]
                  },
                  else: 0
                }
              }
            }
          }
        }
      });
    }

    aggregationPipeline.push(
      { $sort: sortField },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          username: 1,
          profile: 1,
          bestWPM: { $round: ['$bestWPM', 1] },
          bestAccuracy: { $round: ['$bestAccuracy', 1] },
          averageWPM: { $round: ['$averageWPM', 1] },
          averageAccuracy: { $round: ['$averageAccuracy', 1] },
          totalTests: 1,
          recentTestDate: 1,
          consistencyScore: { $round: [{ $ifNull: ['$consistencyScore', 0] }, 1] },
        }
      }
    );

    const leaderboard = await TypingTest.aggregate(aggregationPipeline);

    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Get total participants for this timeframe
    const totalParticipants = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$user'
        }
      },
      { $count: 'total' }
    ]);

    const participantCount = totalParticipants[0]?.total || 0;

    res.json({
      leaderboard: rankedLeaderboard,
      metadata: {
        timeframe,
        metric,
        category,
        totalParticipants: participantCount,
        entriesShown: rankedLeaderboard.length,
        lastUpdated: new Date().toISOString(),
      },
      message: 'Leaderboard retrieved successfully',
    });
  } catch (error) {
    console.error('Leaderboard retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve leaderboard',
      message: error.message,
    });
  }
});

// Get user's ranking
router.get('/rank/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.userId; // Use provided userId or authenticated user's ID
    const { timeframe = 'all', metric = 'wpm' } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide a user ID or authenticate',
      });
    }

    const matchCondition = { 
      isCompleted: true, 
      isPublic: true 
    };

    // Add time filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'yearly':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        matchCondition.createdAt = { $gte: startDate };
      }
    }

    // Get user's best performance
    const userStats = await TypingTest.aggregate([
      { 
        $match: { 
          ...matchCondition,
          user: mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: '$user',
          bestWPM: { $max: '$results.wpm' },
          bestAccuracy: { $max: '$results.accuracy' },
          averageWPM: { $avg: '$results.wpm' },
          totalTests: { $sum: 1 },
        }
      }
    ]);

    if (userStats.length === 0) {
      return res.status(404).json({
        error: 'No data found',
        message: 'No test data found for this user in the specified timeframe',
      });
    }

    const userPerformance = userStats[0];
    let rankQuery;

    // Determine ranking based on metric
    switch (metric) {
      case 'accuracy':
        rankQuery = {
          ...matchCondition,
          $or: [
            { 'results.accuracy': { $gt: userPerformance.bestAccuracy } },
            { 
              'results.accuracy': userPerformance.bestAccuracy,
              'results.wpm': { $gt: userPerformance.bestWPM }
            }
          ]
        };
        break;
      default: // wpm
        rankQuery = {
          ...matchCondition,
          $or: [
            { 'results.wpm': { $gt: userPerformance.bestWPM } },
            { 
              'results.wpm': userPerformance.bestWPM,
              'results.accuracy': { $gt: userPerformance.bestAccuracy }
            }
          ]
        };
    }

    // Count users performing better
    const betterPerformers = await TypingTest.aggregate([
      { $match: rankQuery },
      {
        $group: {
          _id: '$user'
        }
      },
      { $count: 'count' }
    ]);

    const rank = (betterPerformers[0]?.count || 0) + 1;

    // Get total participants
    const totalParticipants = await TypingTest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$user'
        }
      },
      { $count: 'total' }
    ]);

    const totalUsers = totalParticipants[0]?.total || 0;
    const percentile = totalUsers > 0 ? Math.round((1 - (rank - 1) / totalUsers) * 100) : 0;

    res.json({
      userStats: userPerformance,
      ranking: {
        rank,
        totalParticipants: totalUsers,
        percentile,
        metric,
        timeframe,
      },
      message: 'User ranking retrieved successfully',
    });
  } catch (error) {
    console.error('Ranking retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user ranking',
      message: error.message,
    });
  }
});

// Get hall of fame (all-time records)
router.get('/hall-of-fame', async (req, res) => {
  try {
    const records = await TypingTest.aggregate([
      { 
        $match: { 
          isCompleted: true, 
          isPublic: true 
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $match: {
          'userInfo.isActive': true
        }
      },
      {
        $facet: {
          fastestWPM: [
            { $sort: { 'results.wpm': -1, 'results.accuracy': -1 } },
            { $limit: 1 },
            {
              $project: {
                type: { $literal: 'Fastest WPM' },
                value: '$results.wpm',
                accuracy: '$results.accuracy',
                username: '$userInfo.username',
                date: '$createdAt',
                testDuration: '$results.timeElapsed',
              }
            }
          ],
          highestAccuracy: [
            { $sort: { 'results.accuracy': -1, 'results.wpm': -1 } },
            { $limit: 1 },
            {
              $project: {
                type: { $literal: 'Highest Accuracy' },
                value: '$results.accuracy',
                wpm: '$results.wpm',
                username: '$userInfo.username',
                date: '$createdAt',
                testDuration: '$results.timeElapsed',
              }
            }
          ],
          perfectAccuracy: [
            { 
              $match: { 
                'results.accuracy': 100 
              }
            },
            { $sort: { 'results.wpm': -1 } },
            { $limit: 1 },
            {
              $project: {
                type: { $literal: 'Perfect Accuracy + Highest WPM' },
                value: '$results.wpm',
                accuracy: '$results.accuracy',
                username: '$userInfo.username',
                date: '$createdAt',
                testDuration: '$results.timeElapsed',
              }
            }
          ],
          longestTest: [
            { $sort: { 'results.timeElapsed': -1 } },
            { $limit: 1 },
            {
              $project: {
                type: { $literal: 'Longest Test Duration' },
                value: '$results.timeElapsed',
                wpm: '$results.wpm',
                accuracy: '$results.accuracy',
                username: '$userInfo.username',
                date: '$createdAt',
              }
            }
          ]
        }
      }
    ]);

    const hallOfFame = [
      ...records[0].fastestWPM,
      ...records[0].highestAccuracy,
      ...records[0].perfectAccuracy,
      ...records[0].longestTest,
    ].filter(record => record); // Remove empty records

    res.json({
      records: hallOfFame,
      message: 'Hall of fame retrieved successfully',
    });
  } catch (error) {
    console.error('Hall of fame retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve hall of fame',
      message: error.message,
    });
  }
});

module.exports = router;
