/**
 * God of YouTube - Analysis Modules
 *
 * Comprehensive YouTube analysis modules for strategic business intelligence
 */

import {
  parseStructure,
  parseLinks,
  parseKeywords,
  parseCTAs,
  parseTimestamps,
  parseContact,
  parseMonetization,
  generateInsights
} from './youtube-parser.js';

// ============================================================================
// MODULE 1: TITLE ANALYSIS
// ============================================================================

export function analyzeTitle(title, description = '') {
  const analysis = {
    length: title.length,
    word_count: title.split(/\s+/).filter(w => w).length,
    character_count: title.length,
    has_numbers: /\d/.test(title),
    has_emoji: /[\u{1F300}-\u{1F9FF}]/u.test(title),
    has_question: title.includes('?'),
    has_exclamation: title.includes('!'),
    has_colon: title.includes(':'),
    clickbait_score: 0,
    seo_score: 0,
    keyword_density: {},
    structure: {}
  };

  // Clickbait detection
  const clickbaitPatterns = [
    /\b(you won't believe|shocking|amazing|incredible|unbelievable|secret|hidden|this will blow your mind)\b/gi,
    /\b(number|top \d+|best \d+|worst \d+)\b/gi,
    /\b(never|always|everyone|nobody)\b/gi,
    /\?$/, // Question mark at end
    /!{2,}/, // Multiple exclamation marks
  ];

  let clickbaitScore = 0;
  clickbaitPatterns.forEach(pattern => {
    if (pattern.test(title)) clickbaitScore += 2;
  });
  analysis.clickbait_score = Math.min(10, clickbaitScore);

  // SEO analysis
  const words = title.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const descWords = description.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const overlap = words.filter(w => descWords.includes(w)).length;

  analysis.seo_score = (
    (title.length >= 30 && title.length <= 60 ? 3 : 1) + // Optimal length
    (overlap > 0 ? 3 : 0) + // Keyword overlap with description
    (words.length >= 5 ? 2 : 1) + // Good word count
    (clickbaitScore < 5 ? 2 : 0) // Not too clickbaity
  );

  // Keyword density
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  analysis.keyword_density = wordFreq;

  // Structure
  analysis.structure = {
    has_hook: title.length > 0 && title.length < 50,
    has_keywords: words.length > 3,
    has_emotional_words: /(amazing|incredible|ultimate|best|worst|secret)/gi.test(title),
    format: title.includes(':') ? 'colon_separated' : title.includes('|') ? 'pipe_separated' : 'simple'
  };

  return analysis;
}

// ============================================================================
// MODULE 2: CHANNEL ANALYSIS
// ============================================================================

export function analyzeChannel(channelData, videos = []) {
  const analysis = {
    metrics: {
      subscribers: channelData.subscriberCount || 0,
      total_views: channelData.viewCount || 0,
      video_count: channelData.videoCount || videos.length,
      avg_views_per_video: 0,
      engagement_rate: 0
    },
    content_strategy: {
      posting_frequency: calculatePostingFrequency(videos),
      video_lengths: analyzeVideoLengths(videos),
      content_types: analyzeContentTypes(videos),
      consistency: analyzeConsistency(videos)
    },
    growth: {
      subscriber_growth: calculateGrowth(videos),
      view_trends: calculateViewTrends(videos),
      engagement_trends: calculateEngagementTrends(videos)
    },
    monetization: {
      strategies: analyzeMonetizationStrategies(videos),
      affiliate_usage: countAffiliateLinks(videos),
      support_platforms: identifySupportPlatforms(videos),
      sponsor_frequency: countSponsors(videos)
    },
    seo_patterns: {
      title_patterns: analyzeTitlePatterns(videos),
      description_patterns: analyzeDescriptionPatterns(videos),
      keyword_strategies: analyzeKeywordStrategies(videos)
    },
    best_performers: identifyBestPerformers(videos)
  };

  if (videos.length > 0) {
    analysis.metrics.avg_views_per_video = analysis.metrics.total_views / videos.length;
  }

  return analysis;
}

function calculatePostingFrequency(videos) {
  if (videos.length < 2) return { frequency: 'unknown', posts_per_week: 0 };

  const dates = videos.map(v => new Date(v.publishedAt || v.upload_date)).sort((a, b) => b - a);
  const oldest = dates[dates.length - 1];
  const newest = dates[0];
  const daysDiff = (newest - oldest) / (1000 * 60 * 60 * 24);
  const postsPerWeek = (videos.length / daysDiff) * 7;

  let frequency = 'irregular';
  if (postsPerWeek >= 3) frequency = 'very_active';
  else if (postsPerWeek >= 1) frequency = 'active';
  else if (postsPerWeek >= 0.5) frequency = 'moderate';
  else if (postsPerWeek > 0) frequency = 'sparse';

  return { frequency, posts_per_week: postsPerWeek };
}

function analyzeVideoLengths(videos) {
  const lengths = videos.map(v => v.duration_seconds || 0).filter(l => l > 0);
  if (lengths.length === 0) return { average: 0, range: 'unknown', preferred: 'unknown' };

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);

  let preferred = 'short';
  if (avg > 1200) preferred = 'very_long';
  else if (avg > 600) preferred = 'long';
  else if (avg > 300) preferred = 'medium';

  return {
    average: Math.round(avg),
    range: `${Math.round(min)}-${Math.round(max)}`,
    preferred
  };
}

function analyzeContentTypes(videos) {
  const types = {};
  videos.forEach(video => {
    const title = (video.title || '').toLowerCase();
    let type = 'general';

    if (/tutorial|how to|guide|learn/.test(title)) type = 'tutorial';
    else if (/review|test|unboxing/.test(title)) type = 'review';
    else if (/vlog|day in|behind the scenes/.test(title)) type = 'vlog';
    else if (/teardown|disassembly|take apart/.test(title)) type = 'teardown';
    else if (/comparison|vs|versus/.test(title)) type = 'comparison';

    types[type] = (types[type] || 0) + 1;
  });

  return types;
}

function analyzeConsistency(videos) {
  if (videos.length < 3) return { score: 0, assessment: 'insufficient_data' };

  const dates = videos.map(v => new Date(v.publishedAt || v.upload_date)).sort((a, b) => b - a);
  const intervals = [];
  for (let i = 0; i < dates.length - 1; i++) {
    intervals.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const consistency = 10 - Math.min(10, variance / 7); // Lower variance = higher consistency

  let assessment = 'inconsistent';
  if (consistency > 8) assessment = 'very_consistent';
  else if (consistency > 6) assessment = 'consistent';
  else if (consistency > 4) assessment = 'somewhat_consistent';

  return { score: consistency, assessment };
}

function calculateGrowth(videos) {
  // Simplified - would need historical data for real growth calculation
  return {
    trend: 'unknown',
    rate: 0,
    assessment: 'insufficient_data'
  };
}

function calculateViewTrends(videos) {
  if (videos.length < 3) return { trend: 'unknown', assessment: 'insufficient_data' };

  const views = videos.map(v => v.viewCount || 0).slice(0, 10); // Last 10 videos
  const recentAvg = views.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = views.slice(3, 6).reduce((a, b) => a + b, 0) / 3;

  const trend = recentAvg > olderAvg * 1.1 ? 'growing' :
                recentAvg < olderAvg * 0.9 ? 'declining' : 'stable';

  return { trend, recent_avg: recentAvg, older_avg: olderAvg };
}

function calculateEngagementTrends(videos) {
  // Would calculate engagement rate trends
  return { trend: 'unknown', assessment: 'insufficient_data' };
}

function analyzeMonetizationStrategies(videos) {
  const strategies = new Set();
  videos.forEach(video => {
    if (video.description_analysis?.monetization) {
      const mon = video.description_analysis.monetization;
      if (mon.affiliate_links.count > 0) strategies.add('affiliate');
      if (mon.support_links.count > 0) strategies.add('support');
      if (mon.sponsor_mentions.count > 0) strategies.add('sponsors');
      if (mon.product_links.count > 0) strategies.add('products');
    }
  });

  return Array.from(strategies);
}

function countAffiliateLinks(videos) {
  return videos.reduce((count, video) => {
    return count + (video.description_analysis?.monetization?.affiliate_links.count || 0);
  }, 0);
}

function identifySupportPlatforms(videos) {
  const platforms = new Set();
  videos.forEach(video => {
    const support = video.description_analysis?.monetization?.support_links;
    if (support?.platforms) {
      support.platforms.forEach(p => platforms.add(p));
    }
  });
  return Array.from(platforms);
}

function countSponsors(videos) {
  return videos.reduce((count, video) => {
    return count + (video.description_analysis?.monetization?.sponsor_mentions.count || 0);
  }, 0);
}

function analyzeTitlePatterns(videos) {
  const patterns = {
    colon_separated: 0,
    pipe_separated: 0,
    question_mark: 0,
    exclamation: 0,
    numbers: 0
  };

  videos.forEach(video => {
    const title = video.title || '';
    if (title.includes(':')) patterns.colon_separated++;
    if (title.includes('|')) patterns.pipe_separated++;
    if (title.includes('?')) patterns.question_mark++;
    if (title.includes('!')) patterns.exclamation++;
    if (/\d/.test(title)) patterns.numbers++;
  });

  return patterns;
}

function analyzeDescriptionPatterns(videos) {
  const patterns = {
    avg_length: 0,
    avg_sections: 0,
    avg_links: 0,
    avg_ctas: 0,
    timestamps_usage: 0
  };

  const withAnalysis = videos.filter(v => v.description_analysis);
  if (withAnalysis.length === 0) return patterns;

  patterns.avg_length = withAnalysis.reduce((sum, v) =>
    sum + (v.description_analysis.structure?.total_length || 0), 0) / withAnalysis.length;
  patterns.avg_sections = withAnalysis.reduce((sum, v) =>
    sum + (v.description_analysis.structure?.sections?.length || 0), 0) / withAnalysis.length;
  patterns.avg_links = withAnalysis.reduce((sum, v) =>
    sum + (v.description_analysis.links?.total_links || 0), 0) / withAnalysis.length;
  patterns.avg_ctas = withAnalysis.reduce((sum, v) =>
    sum + (v.description_analysis.ctas?.total_ctas || 0), 0) / withAnalysis.length;
  patterns.timestamps_usage = withAnalysis.filter(v =>
    v.description_analysis.timestamps?.has_chapters).length / withAnalysis.length;

  return patterns;
}

function analyzeKeywordStrategies(videos) {
  const keywords = {};
  videos.forEach(video => {
    const primary = video.description_analysis?.keywords?.primary_keywords?.first_sentence || [];
    primary.forEach(kw => {
      keywords[kw] = (keywords[kw] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return { top_keywords: topKeywords, total_unique: Object.keys(keywords).length };
}

function identifyBestPerformers(videos) {
  return videos
    .filter(v => v.viewCount)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map(v => ({
      title: v.title,
      views: v.viewCount,
      video_id: v.videoId || v.id,
      performance_score: calculatePerformanceScore(v)
    }));
}

function calculatePerformanceScore(video) {
  const views = video.viewCount || 0;
  const likes = video.likeCount || 0;
  const comments = video.commentCount || 0;

  // Simple scoring - would be more sophisticated in production
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
  const score = Math.min(10, (engagementRate * 10) + (views > 100000 ? 2 : 0));

  return score;
}

// ============================================================================
// MODULE 3: COMPETITIVE ANALYSIS
// ============================================================================

export function compareChannels(channels) {
  const comparison = {
    metrics_comparison: {
      subscribers: compareMetric(channels, 'subscriberCount'),
      total_views: compareMetric(channels, 'viewCount'),
      avg_views: compareMetric(channels, 'avgViewsPerVideo'),
      video_count: compareMetric(channels, 'videoCount')
    },
    strategy_comparison: {
      posting_frequency: compareStrategy(channels, 'content_strategy.posting_frequency'),
      content_types: compareStrategy(channels, 'content_strategy.content_types'),
      monetization: compareStrategy(channels, 'monetization.strategies'),
      seo_approach: compareStrategy(channels, 'seo_patterns')
    },
    gaps: identifyGaps(channels),
    opportunities: identifyOpportunities(channels),
    benchmarks: calculateBenchmarks(channels)
  };

  return comparison;
}

function compareMetric(channels, metric) {
  const values = channels.map(c => {
    const value = getNestedValue(c, metric);
    return { channel: c.name || c.channelName, value };
  });

  const sorted = [...values].sort((a, b) => (b.value || 0) - (a.value || 0));
  const avg = values.reduce((sum, v) => sum + (v.value || 0), 0) / values.length;

  return {
    leader: sorted[0],
    average: avg,
    all: values
  };
}

function compareStrategy(channels, path) {
  const strategies = channels.map(c => ({
    channel: c.name || c.channelName,
    strategy: getNestedValue(c, path)
  }));

  return strategies;
}

function identifyGaps(channels) {
  const gaps = [];

  // Find strategies used by others but not by you (assuming first is "you")
  if (channels.length > 1) {
    const yourChannel = channels[0];
    const competitors = channels.slice(1);

    // Monetization gaps
    const yourMonetization = new Set(yourChannel.monetization?.strategies || []);
    competitors.forEach(comp => {
      const compMonetization = new Set(comp.monetization?.strategies || []);
      compMonetization.forEach(strategy => {
        if (!yourMonetization.has(strategy)) {
          gaps.push({
            type: 'monetization',
            strategy,
            opportunity: `Consider adding ${strategy} monetization like ${comp.name || comp.channelName}`
          });
        }
      });
    });

    // Content type gaps
    const yourTypes = Object.keys(yourChannel.content_strategy?.content_types || {});
    competitors.forEach(comp => {
      const compTypes = Object.keys(comp.content_strategy?.content_types || {});
      compTypes.forEach(type => {
        if (!yourTypes.includes(type)) {
          gaps.push({
            type: 'content',
            strategy: type,
            opportunity: `Consider creating ${type} content like ${comp.name || comp.channelName}`
          });
        }
      });
    });
  }

  return gaps;
}

function identifyOpportunities(channels) {
  const opportunities = [];

  // Find underserved areas
  const allContentTypes = new Set();
  channels.forEach(c => {
    Object.keys(c.content_strategy?.content_types || {}).forEach(type => {
      allContentTypes.add(type);
    });
  });

  // Find content types with low competition
  allContentTypes.forEach(type => {
    const channelsWithType = channels.filter(c =>
      c.content_strategy?.content_types?.[type] > 0
    ).length;

    if (channelsWithType < channels.length * 0.3) {
      opportunities.push({
        type: 'content',
        opportunity: `${type} content is underserved - opportunity for differentiation`,
        competition_level: 'low'
      });
    }
  });

  return opportunities;
}

function calculateBenchmarks(channels) {
  const benchmarks = {
    avg_subscribers: 0,
    avg_views_per_video: 0,
    avg_posting_frequency: 0,
    top_performers: []
  };

  if (channels.length === 0) return benchmarks;

  benchmarks.avg_subscribers = channels.reduce((sum, c) =>
    sum + (c.metrics?.subscribers || 0), 0) / channels.length;

  benchmarks.avg_views_per_video = channels.reduce((sum, c) =>
    sum + (c.metrics?.avg_views_per_video || 0), 0) / channels.length;

  benchmarks.avg_posting_frequency = channels.reduce((sum, c) =>
    sum + (c.content_strategy?.posting_frequency?.posts_per_week || 0), 0) / channels.length;

  benchmarks.top_performers = channels
    .filter(c => c.best_performers && c.best_performers.length > 0)
    .flatMap(c => c.best_performers.map(p => ({ ...p, channel: c.name || c.channelName })))
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  return benchmarks;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ============================================================================
// MODULE 4: STRATEGIC RECOMMENDATIONS
// ============================================================================

export function generateStrategicRecommendations(analysis) {
  const recommendations = {
    content_strategy: [],
    seo_optimization: [],
    monetization: [],
    growth: [],
    competitive: []
  };

  // Content strategy recommendations
  if (analysis.channel?.content_strategy?.posting_frequency?.frequency === 'irregular') {
    recommendations.content_strategy.push({
      priority: 'high',
      recommendation: 'Increase posting frequency for better growth',
      action: 'Aim for at least 1 video per week'
    });
  }

  // SEO optimization recommendations
  if (analysis.channel?.seo_patterns?.description_patterns?.avg_length < 500) {
    recommendations.seo_optimization.push({
      priority: 'high',
      recommendation: 'Increase description length for better SEO',
      action: 'Aim for 500+ words in descriptions'
    });
  }

  // Monetization recommendations
  const monetizationStrategies = analysis.channel?.monetization?.strategies || [];
  if (!monetizationStrategies.includes('affiliate')) {
    recommendations.monetization.push({
      priority: 'medium',
      recommendation: 'Consider adding affiliate links',
      action: 'Add relevant affiliate links to video descriptions'
    });
  }

  // Growth recommendations
  if (analysis.channel?.growth?.view_trends?.trend === 'declining') {
    recommendations.growth.push({
      priority: 'high',
      recommendation: 'Views are declining - review content strategy',
      action: 'Analyze top performers and replicate successful patterns'
    });
  }

  // Competitive recommendations
  if (analysis.competitive?.gaps?.length > 0) {
    recommendations.competitive.push({
      priority: 'medium',
      recommendation: 'Opportunities identified from competitor analysis',
      action: analysis.competitive.gaps.map(g => g.opportunity).join('; ')
    });
  }

  return recommendations;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function extractChannelId(url) {
  const patterns = [
    /youtube\.com\/channel\/([^\/\?]+)/,
    /youtube\.com\/c\/([^\/\?]+)/,
    /youtube\.com\/user\/([^\/\?]+)/,
    /youtube\.com\/@([^\/\?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
