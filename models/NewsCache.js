import mongoose from 'mongoose';

const newsCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  limit: {
    type: Number,
    required: true,
    default: 10
  },
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  articles: {
    type: Array,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create unique index on cacheKey
newsCacheSchema.index({ cacheKey: 1 }, { unique: true });
// TTL index: automatically delete documents when expiresAt is in the past
newsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.NewsCache || mongoose.model('NewsCache', newsCacheSchema);

