/**
 * YouTube Keyword Analyzer
 *
 * Searches YouTube for videos by keyword and analyzes them to find patterns
 */

import { execSync } from 'child_process';

// Search YouTube using yt-dlp
function searchYouTube(keyword, limit = 10) {
  try {
    // Use yt-dlp to search
    const command = `yt-dlp "ytsearch${limit}:${keyword}" --dump-json --flat-playlist 2>/dev/null`;
    const result = execSync(command, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

    // Parse results (yt-dlp returns one JSON per line)
    const lines = result.trim().split('\n').filter(line => line.trim());
    const videos = [];

    for (const line of lines) {
      try {
        const video = JSON.parse(line);
        if (video.id && video.title) {
          videos.push({
            videoId: video.id,
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            channel: video.channel || video.uploader,
            viewCount: video.view_count || 0,
            duration: video.duration_string || '',
            published: video.upload_date || ''
          });
        }
      } catch (e) {
        // Skip invalid JSON lines
        continue;
      }
    }

    return videos;
  } catch (error) {
    // Fallback: Try HTML scraping
    return searchYouTubeHTML(keyword, limit);
  }
}

// Fallback: Search via HTML scraping
function searchYouTubeHTML(keyword, limit) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
    const html = execSync(`curl -sL "${searchUrl}"`, { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });

    // Extract video IDs from search results
    const videoIdPattern = /"videoId":"([^"]+)"/g;
    const videoIds = [];
    let match;

    while ((match = videoIdPattern.exec(html)) !== null && videoIds.length < limit) {
      if (!videoIds.includes(match[1])) {
        videoIds.push(match[1]);
      }
    }

    // Extract titles
    const titlePattern = /"title":{"runs":\[{"text":"([^"]+)"}/g;
    const titles = [];
    while ((match = titlePattern.exec(html)) !== null && titles.length < limit) {
      titles.push(match[1]);
    }

    // Extract channel names
    const channelPattern = /"ownerText":{"runs":\[{"text":"([^"]+)"}/g;
    const channels = [];
    while ((match = channelPattern.exec(html)) !== null && channels.length < limit) {
      channels.push(match[1]);
    }

    // Extract view counts
    const viewPattern = /"viewCountText":{"simpleText":"([^"]+)"}/g;
    const views = [];
    while ((match = viewPattern.exec(html)) !== null && views.length < limit) {
      views.push(match[1]);
    }

    const videos = [];
    for (let i = 0; i < Math.min(videoIds.length, limit); i++) {
      videos.push({
        videoId: videoIds[i],
        title: titles[i] || 'Unknown',
        url: `https://www.youtube.com/watch?v=${videoIds[i]}`,
        channel: channels[i] || 'Unknown',
        viewCount: parseViewCount(views[i] || '0'),
        duration: '',
        published: ''
      });
    }

    return videos;
  } catch (error) {
    console.error('HTML search failed:', error.message);
    return [];
  }
}

function parseViewCount(viewText) {
  // Parse "1.2M views", "500K views", etc.
  const match = viewText.match(/([\d.]+)([MK])?/);
  if (!match) return 0;

  const number = parseFloat(match[1]);
  const multiplier = match[2] === 'M' ? 1000000 : match[2] === 'K' ? 1000 : 1;
  return Math.round(number * multiplier);
}

// Aggregate analyses
function aggregateAnalyses(analyses) {
  if (analyses.length === 0) {
    return {
      error: 'No analyses to aggregate'
    };
  }

  // Description patterns
  const descriptionLengths = analyses
    .map(a => a.description_analysis?.structure?.total_length || 0)
    .filter(l => l > 0);

  const descriptionSections = analyses
    .map(a => a.description_analysis?.structure?.sections?.length || 0)
    .filter(s => s > 0);

  // SEO patterns
  const seoScores = analyses
    .map(a => a.description_analysis?.keywords?.seo_analysis?.overall_seo_score || 0)
    .filter(s => s > 0);

  // Link patterns
  const linkCounts = analyses
    .map(a => a.description_analysis?.links?.total_links || 0);

  // CTA patterns
  const ctaCounts = analyses
    .map(a => a.description_analysis?.ctas?.total_ctas || 0);

  // Timestamp usage
  const timestampUsage = analyses
    .filter(a => a.description_analysis?.timestamps?.has_chapters).length;

  // Monetization patterns
  const monetizationStrategies = {};
  analyses.forEach(a => {
    const strategy = a.description_analysis?.monetization?.monetization_strategy || 'none';
    monetizationStrategies[strategy] = (monetizationStrategies[strategy] || 0) + 1;
  });

  // Common keywords
  const allKeywords = {};
  analyses.forEach(a => {
    const keywords = a.description_analysis?.keywords?.primary_keywords?.first_sentence || [];
    keywords.forEach(kw => {
      allKeywords[kw.toLowerCase()] = (allKeywords[kw.toLowerCase()] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(allKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, percentage: (count / analyses.length) * 100 }));

  // Link categories
  const linkCategories = {};
  analyses.forEach(a => {
    const categories = a.description_analysis?.links?.categories || {};
    Object.keys(categories).forEach(cat => {
      linkCategories[cat] = (linkCategories[cat] || 0) + (categories[cat]?.length || 0);
    });
  });

  // CTA types
  const ctaTypes = {};
  analyses.forEach(a => {
    const ctas = a.description_analysis?.ctas?.cta_distribution || {};
    Object.keys(ctas).forEach(type => {
      ctaTypes[type] = (ctaTypes[type] || 0) + ctas[type];
    });
  });

  // Performance metrics
  const viewCounts = analyses
    .map(a => a.basic_metrics?.view_count || 0)
    .filter(v => v > 0);

  return {
    videos_analyzed: analyses.length,
    description_patterns: {
      avg_length: descriptionLengths.length > 0
        ? Math.round(descriptionLengths.reduce((a, b) => a + b, 0) / descriptionLengths.length)
        : 0,
      avg_sections: descriptionSections.length > 0
        ? Math.round(descriptionSections.reduce((a, b) => a + b, 0) / descriptionSections.length)
        : 0,
      length_range: descriptionLengths.length > 0
        ? `${Math.min(...descriptionLengths)}-${Math.max(...descriptionLengths)}`
        : 'N/A'
    },
    seo_patterns: {
      avg_seo_score: seoScores.length > 0
        ? (seoScores.reduce((a, b) => a + b, 0) / seoScores.length).toFixed(1)
        : '0',
      top_keywords: topKeywords,
      keyword_coverage: topKeywords.length > 0 ? topKeywords[0].percentage : 0
    },
    link_patterns: {
      avg_links: linkCounts.length > 0
        ? (linkCounts.reduce((a, b) => a + b, 0) / linkCounts.length).toFixed(1)
        : '0',
      categories: linkCategories,
      most_common_category: Object.keys(linkCategories).length > 0
        ? Object.entries(linkCategories).sort((a, b) => b[1] - a[1])[0][0]
        : 'none'
    },
    cta_patterns: {
      avg_ctas: ctaCounts.length > 0
        ? (ctaCounts.reduce((a, b) => a + b, 0) / ctaCounts.length).toFixed(1)
        : '0',
      types: ctaTypes,
      most_common_type: Object.keys(ctaTypes).length > 0
        ? Object.entries(ctaTypes).sort((a, b) => b[1] - a[1])[0][0]
        : 'none'
    },
    timestamp_usage: {
      videos_with_timestamps: timestampUsage,
      percentage: (timestampUsage / analyses.length) * 100
    },
    monetization_patterns: {
      strategies: monetizationStrategies,
      most_common: Object.keys(monetizationStrategies).length > 0
        ? Object.entries(monetizationStrategies).sort((a, b) => b[1] - a[1])[0][0]
        : 'none'
    },
    performance: {
      avg_views: viewCounts.length > 0
        ? Math.round(viewCounts.reduce((a, b) => a + b, 0) / viewCounts.length)
        : 0,
      total_views: viewCounts.reduce((a, b) => a + b, 0),
      top_performer: analyses.length > 0
        ? analyses.reduce((top, current) =>
            (current.basic_metrics?.view_count || 0) > (top.basic_metrics?.view_count || 0)
              ? current : top
          )
        : null
    }
  };
}

// Extract best practices
function extractBestPractices(analyses, aggregated) {
  const practices = {
    top_performers: [],
    common_patterns: {},
    seo_best_practices: [],
    monetization_best_practices: [],
    recommendations: []
  };

  // Top performers (by views)
  practices.top_performers = analyses
    .filter(a => a.basic_metrics?.view_count > 0)
    .sort((a, b) => (b.basic_metrics.view_count || 0) - (a.basic_metrics.view_count || 0))
    .slice(0, 5)
    .map(a => ({
      title: a.basic_metrics.video_title,
      views: a.basic_metrics.view_count,
      video_id: a.video_id,
      seo_score: a.description_analysis?.keywords?.seo_analysis?.overall_seo_score || 0
    }));

  // Common patterns in top performers
  const top5 = practices.top_performers.slice(0, 5);
  const top5Analyses = analyses.filter(a =>
    top5.some(tp => tp.video_id === a.video_id)
  );

  // SEO best practices
  const topSEOScores = analyses
    .map(a => ({
      analysis: a,
      score: a.description_analysis?.keywords?.seo_analysis?.overall_seo_score || 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  practices.seo_best_practices = topSEOScores.map(item => ({
    title: item.analysis.basic_metrics.video_title,
    seo_score: item.score,
    first_sentence: item.analysis.description_analysis?.structure?.above_the_fold?.text?.substring(0, 100) || '',
    keywords: item.analysis.description_analysis?.keywords?.primary_keywords?.first_sentence?.slice(0, 5) || []
  }));

  // Monetization best practices
  const monetizedVideos = analyses.filter(a =>
    (a.description_analysis?.monetization?.revenue_streams?.length || 0) > 0
  );

  practices.monetization_best_practices = monetizedVideos.slice(0, 5).map(a => ({
    title: a.basic_metrics.video_title,
    strategy: a.description_analysis?.monetization?.monetization_strategy || 'none',
    revenue_streams: a.description_analysis?.monetization?.revenue_streams || [],
    affiliate_links: a.description_analysis?.monetization?.affiliate_links?.count || 0,
    support_links: a.description_analysis?.monetization?.support_links?.count || 0
  }));

  // Recommendations
  if (aggregated.timestamp_usage.percentage < 50) {
    practices.recommendations.push({
      type: 'seo',
      recommendation: 'Consider adding timestamps/chapters - only ' +
        Math.round(aggregated.timestamp_usage.percentage) +
        '% of top videos use them, but they improve SEO significantly'
    });
  }

  if (aggregated.description_patterns.avg_length < 500) {
    practices.recommendations.push({
      type: 'seo',
      recommendation: 'Increase description length - average is ' +
        aggregated.description_patterns.avg_length +
        ' chars, aim for 500+ for better SEO'
    });
  }

  if (aggregated.link_patterns.avg_links < 3) {
    practices.recommendations.push({
      type: 'monetization',
      recommendation: 'Add more links - average is ' +
        aggregated.link_patterns.avg_links +
        ' links, top videos typically have 5+ links'
    });
  }

  return practices;
}

// Identify opportunities
function identifyOpportunities(analyses, aggregated) {
  const opportunities = {
    underserved_keywords: [],
    missing_strategies: [],
    content_gaps: []
  };

  // Find keywords used by top performers but not by all
  const topPerformers = analyses
    .filter(a => (a.basic_metrics?.view_count || 0) > 100000)
    .slice(0, 5);

  const topKeywords = new Set();
  topPerformers.forEach(a => {
    const keywords = a.description_analysis?.keywords?.primary_keywords?.first_sentence || [];
    keywords.forEach(kw => topKeywords.add(kw.toLowerCase()));
  });

  const allKeywords = new Set();
  analyses.forEach(a => {
    const keywords = a.description_analysis?.keywords?.primary_keywords?.first_sentence || [];
    keywords.forEach(kw => allKeywords.add(kw.toLowerCase()));
  });

  // Keywords used by top performers but not common
  topKeywords.forEach(kw => {
    if (!allKeywords.has(kw)) {
      opportunities.underserved_keywords.push(kw);
    }
  });

  // Missing monetization strategies
  const commonStrategies = new Set();
  analyses.forEach(a => {
    const strategies = a.description_analysis?.monetization?.revenue_streams || [];
    strategies.forEach(s => commonStrategies.add(s));
  });

  const allPossibleStrategies = ['affiliate', 'support', 'sponsors', 'products'];
  allPossibleStrategies.forEach(strategy => {
    if (!commonStrategies.has(strategy)) {
      opportunities.missing_strategies.push({
        strategy,
        opportunity: `Few videos use ${strategy} - potential differentiation opportunity`
      });
    }
  });

  return opportunities;
}

// Export all functions
export {
  searchYouTube,
  aggregateAnalyses,
  extractBestPractices,
  identifyOpportunities
};
