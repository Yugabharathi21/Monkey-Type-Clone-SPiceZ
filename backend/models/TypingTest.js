const mongoose = require('mongoose');

const typingTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isGuest;
    },
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestId: {
    type: String,
    required: function() {
      return this.isGuest;
    },
  },
  testConfig: {
    textType: {
      type: String,
      enum: ['random', 'quote', 'custom'],
      default: 'random',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    duration: {
      type: Number, // in seconds
      default: 60,
    },
    language: {
      type: String,
      default: 'english',
    },
    wordCount: {
      type: Number,
      default: null,
    },
  },
  testContent: {
    originalText: {
      type: String,
      required: true,
    },
    textSource: {
      type: String, // quote author, book name, etc.
    },
  },
  results: {
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeElapsed: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCharacters: {
      type: Number,
      required: true,
      min: 0,
    },
    correctCharacters: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrectCharacters: {
      type: Number,
      required: true,
      min: 0,
    },
    missedCharacters: {
      type: Number,
      default: 0,
      min: 0,
    },
    extraCharacters: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  keystrokeData: [{
    character: String,
    timestamp: Number,
    correct: Boolean,
    timeFromStart: Number, // milliseconds from test start
  }],
  wpmHistory: [{
    timestamp: Number,
    wpm: Number,
  }],
  accuracyHistory: [{
    timestamp: Number,
    accuracy: Number,
  }],
  metadata: {
    userAgent: String,
    screenResolution: String,
    keyboardLayout: String,
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    pausedDuration: {
      type: Number,
      default: 0, // milliseconds
    },
    theme: String,
  },
  tags: [String], // for categorizing tests
  notes: {
    type: String,
    maxlength: 1000,
  },
  isCompleted: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
typingTestSchema.index({ user: 1, createdAt: -1 });
typingTestSchema.index({ 'results.wpm': -1 });
typingTestSchema.index({ 'results.accuracy': -1 });
typingTestSchema.index({ createdAt: -1 });
typingTestSchema.index({ isGuest: 1, guestId: 1 });
typingTestSchema.index({ isPublic: 1, 'results.wpm': -1 });

// Virtual for calculating consistency score
typingTestSchema.virtual('consistencyScore').get(function() {
  if (!this.wpmHistory || this.wpmHistory.length < 2) return 0;
  
  const wpmValues = this.wpmHistory.map(h => h.wpm);
  const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
  const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert to consistency score (lower deviation = higher consistency)
  return Math.max(0, 100 - (standardDeviation / mean) * 100);
});

// Virtual for performance rating
typingTestSchema.virtual('performanceRating').get(function() {
  const wpm = this.results.wpm;
  const accuracy = this.results.accuracy;
  
  if (wpm >= 80 && accuracy >= 95) return 'excellent';
  if (wpm >= 60 && accuracy >= 90) return 'good';
  if (wpm >= 40 && accuracy >= 80) return 'average';
  return 'needs-improvement';
});

// Method to calculate detailed statistics
typingTestSchema.methods.getDetailedStats = function() {
  const results = this.results;
  
  return {
    basic: {
      wpm: results.wpm,
      accuracy: results.accuracy,
      timeElapsed: results.timeElapsed,
    },
    characters: {
      total: results.totalCharacters,
      correct: results.correctCharacters,
      incorrect: results.incorrectCharacters,
      missed: results.missedCharacters || 0,
      extra: results.extraCharacters || 0,
    },
    advanced: {
      consistencyScore: this.consistencyScore,
      performanceRating: this.performanceRating,
      avgKeystrokeTime: this.keystrokeData.length > 0 
        ? this.keystrokeData.reduce((sum, k) => sum + k.timeFromStart, 0) / this.keystrokeData.length 
        : 0,
      errorRate: ((results.incorrectCharacters / results.totalCharacters) * 100).toFixed(2),
    },
  };
};

// Static method to get user's best performances
typingTestSchema.statics.getUserBestPerformances = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isCompleted: true } },
    {
      $group: {
        _id: '$user',
        bestWPM: { $max: '$results.wpm' },
        bestAccuracy: { $max: '$results.accuracy' },
        averageWPM: { $avg: '$results.wpm' },
        averageAccuracy: { $avg: '$results.accuracy' },
        totalTests: { $sum: 1 },
        totalTimeTyped: { $sum: '$results.timeElapsed' },
      }
    }
  ]);
};

// Static method for leaderboard
typingTestSchema.statics.getLeaderboard = function(limit = 10, timeframe = 'all') {
  const matchCondition = { isCompleted: true, isPublic: true };
  
  // Add time filter if specified
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
    }
    
    if (startDate) {
      matchCondition.createdAt = { $gte: startDate };
    }
  }
  
  return this.aggregate([
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
      $group: {
        _id: '$user',
        username: { $first: '$userInfo.username' },
        bestWPM: { $max: '$results.wpm' },
        bestAccuracy: { $max: '$results.accuracy' },
        averageWPM: { $avg: '$results.wpm' },
        averageAccuracy: { $avg: '$results.accuracy' },
        totalTests: { $sum: 1 },
        recentTest: { $last: '$createdAt' },
      }
    },
    { $sort: { bestWPM: -1, bestAccuracy: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('TypingTest', typingTestSchema);
