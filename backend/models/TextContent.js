const mongoose = require('mongoose');

const textContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['quotes', 'literature', 'programming', 'common-words', 'custom'],
    default: 'custom',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  language: {
    type: String,
    default: 'english',
  },
  author: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
  },
  tags: [String],
  wordCount: {
    type: Number,
    required: true,
  },
  characterCount: {
    type: Number,
    required: true,
  },
  averageWordLength: {
    type: Number,
  },
  commonality: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Indexes
textContentSchema.index({ category: 1, difficulty: 1 });
textContentSchema.index({ language: 1 });
textContentSchema.index({ isActive: 1 });
textContentSchema.index({ tags: 1 });
textContentSchema.index({ 'rating.average': -1 });

// Pre-save middleware to calculate word and character counts
textContentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/);
    this.wordCount = words.length;
    this.characterCount = this.content.length;
    this.averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  }
  next();
});

// Method to increment usage count
textContentSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to get random text by criteria
textContentSchema.statics.getRandomText = function(criteria = {}) {
  const match = { isActive: true, ...criteria };
  
  return this.aggregate([
    { $match: match },
    { $sample: { size: 1 } }
  ]);
};

module.exports = mongoose.model('TextContent', textContentSchema);
