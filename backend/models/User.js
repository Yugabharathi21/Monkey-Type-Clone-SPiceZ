const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    country: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
  },
  preferences: {
    theme: {
      type: String,
      enum: ['Type Monkey', 'Ocean Blue', 'Groove Forest', 'Olive Green', 'Sunset Orange', 'Young Clam', 'Modern', 'Discord Dark'],
      default: 'Type Monkey',
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    showWPM: {
      type: Boolean,
      default: true,
    },
    showAccuracy: {
      type: Boolean,
      default: true,
    },
  },
  stats: {
    totalTests: {
      type: Number,
      default: 0,
    },
    totalTimeTyped: {
      type: Number,
      default: 0, // in seconds
    },
    bestWPM: {
      type: Number,
      default: 0,
    },
    bestAccuracy: {
      type: Number,
      default: 0,
    },
    averageWPM: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    totalCharactersTyped: {
      type: Number,
      default: 0,
    },
    totalCorrectCharacters: {
      type: Number,
      default: 0,
    },
  },
  achievements: [{
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'stats.bestWPM': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.firstName || this.profile.lastName || this.username;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update user stats
userSchema.methods.updateStats = function(testResult) {
  this.stats.totalTests += 1;
  this.stats.totalTimeTyped += testResult.timeElapsed;
  this.stats.totalCharactersTyped += testResult.totalCharacters;
  this.stats.totalCorrectCharacters += testResult.correctCharacters;
  
  // Update best scores
  if (testResult.wpm > this.stats.bestWPM) {
    this.stats.bestWPM = testResult.wpm;
  }
  
  if (testResult.accuracy > this.stats.bestAccuracy) {
    this.stats.bestAccuracy = testResult.accuracy;
  }
  
  // Calculate averages
  this.stats.averageWPM = Math.round(
    (this.stats.averageWPM * (this.stats.totalTests - 1) + testResult.wpm) / this.stats.totalTests
  );
  
  this.stats.averageAccuracy = Math.round(
    (this.stats.averageAccuracy * (this.stats.totalTests - 1) + testResult.accuracy) / this.stats.totalTests
  );
  
  return this.save();
};

// Method to add achievement
userSchema.methods.addAchievement = function(achievement) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(a => a.name === achievement.name);
  if (!existingAchievement) {
    this.achievements.push(achievement);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema);
