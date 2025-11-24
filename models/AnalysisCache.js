import mongoose from 'mongoose';

const analysisCacheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  snippet: {
    type: String,
    default: ''
  },
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  analysis: {
    type: String,
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
analysisCacheSchema.index({ cacheKey: 1 }, { unique: true });
// TTL index: automatically delete documents when expiresAt is in the past
analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AnalysisCache || mongoose.model('AnalysisCache', analysisCacheSchema);

