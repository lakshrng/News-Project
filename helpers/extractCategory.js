/**
 * Extract category from article title, summary, or content
 */

const categoryKeywords = {
  'Politics': ['election', 'minister', 'government', 'parliament', 'political', 'party', 'vote', 'candidate', 'politics', 'democracy', 'policy', 'bill', 'law'],
  'Technology': ['tech', 'technology', 'ai', 'artificial intelligence', 'software', 'app', 'digital', 'internet', 'cyber', 'computer', 'mobile', 'startup', 'innovation', 'gadget', 'device'],
  'Sports': ['sport', 'cricket', 'football', 'hockey', 'tennis', 'olympics', 'championship', 'tournament', 'match', 'player', 'team', 'coach', 'stadium'],
  'Business': ['business', 'economy', 'market', 'stock', 'trade', 'company', 'corporate', 'finance', 'investment', 'bank', 'profit', 'revenue', 'business'],
  'Entertainment': ['movie', 'film', 'actor', 'actress', 'bollywood', 'hollywood', 'music', 'song', 'celebrity', 'entertainment', 'show', 'tv', 'series'],
  'Health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'covid', 'vaccine', 'healthcare', 'patient'],
  'Science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'space', 'nasa', 'climate', 'environment'],
  'General': []
};

/**
 * Extract category from text
 * @param {string} text - Article title, summary, or content
 * @returns {string} Category name
 */
export function extractCategory(text = '') {
  if (!text || typeof text !== 'string') {
    return 'General';
  }

  const lowerText = text.toLowerCase();
  const categoryScores = {};

  // Score each category based on keyword matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'General') continue;
    
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    categoryScores[category] = score;
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(categoryScores));
  
  if (maxScore === 0) {
    return 'General';
  }

  // Return category with highest score
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score === maxScore) {
      return category;
    }
  }

  return 'General';
}

/**
 * Get category abbreviation for display
 * @param {string} category - Full category name
 * @returns {string} Abbreviated category
 */
export function getCategoryAbbr(category) {
  const abbrMap = {
    'Politics': 'POLITICS',
    'Technology': 'TECH',
    'Sports': 'SPORTS',
    'Business': 'BUSINESS',
    'Entertainment': 'ENT',
    'Health': 'HEALTH',
    'Science': 'SCIENCE',
    'General': 'NEWS'
  };
  
  return abbrMap[category] || 'NEWS';
}

