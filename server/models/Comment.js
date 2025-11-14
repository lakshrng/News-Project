const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
commentSchema.index({ news: 1, isApproved: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model('Comment', commentSchema);
