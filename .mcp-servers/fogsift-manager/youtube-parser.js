/**
 * YouTube Description Parser
 *
 * Parses YouTube video descriptions to extract strategic business intelligence
 */

// Extract video ID from URL
function extractVideoId(url) {
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

// Parse description structure
function parseStructure(text) {
  const sections = text.split(/\n\n+/).filter(s => s.trim());
  const aboveTheFold = sections[0]?.substring(0, 200) || '';
  const firstSentences = aboveTheFold.split(/[.!?]+/).slice(0, 3).join('. ');

  // Detect formatting
  const boldMatches = text.match(/\*\*(.*?)\*\*/g) || [];
  const boldText = boldMatches.map(m => m.replace(/\*\*/g, ''));

  // Detect lists
  const listItems = text.match(/^[\s]*[-*•]\s+(.+)$/gm) || [];
  const lists = listItems.length > 0 ? [{
    type: 'bulleted',
    items: listItems.length,
    content: listItems.map(item => item.replace(/^[\s]*[-*•]\s+/, ''))
  }] : [];

  return {
    total_length: text.length,
    word_count: text.split(/\s+/).filter(w => w).length,
    character_count: text.length,
    sections: sections.map((section, index) => ({
      index,
      type: index === 0 ? 'introduction' : index === sections.length - 1 ? 'footer' : 'body',
      content: section.substring(0, 200),
      length: section.length,
      line_count: section.split('\n').length,
      has_links: /https?:\/\//.test(section),
      has_formatting: /\*\*|__|`/.test(section)
    })),
    above_the_fold: {
      text: firstSentences,
      length: firstSentences.length,
      word_count: firstSentences.split(/\s+/).filter(w => w).length,
      is_optimized: firstSentences.length > 100
    },
    formatting: {
      bold_sections: boldText,
      line_breaks: text.split('\n').length - 1,
      lists
    }
  };
}

// Extract and categorize links
function parseLinks(text) {
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const urls = text.match(urlPattern) || [];
  const links = [];

  const categories = {
    social_media: {
      patterns: [
        /twitter\.com|t\.co|x\.com/,
        /instagram\.com/,
        /facebook\.com/,
        /tiktok\.com/,
        /discord\.gg|discord\.com/,
        /reddit\.com/,
        /linkedin\.com/
      ],
      platforms: {
        'twitter.com': 'Twitter',
        't.co': 'Twitter',
        'x.com': 'Twitter',
        'instagram.com': 'Instagram',
        'facebook.com': 'Facebook',
        'tiktok.com': 'TikTok',
        'discord.gg': 'Discord',
        'discord.com': 'Discord',
        'reddit.com': 'Reddit',
        'linkedin.com': 'LinkedIn'
      }
    },
    affiliate: {
      patterns: [
        /amzn\.to|amazon\.com\/.*\/ref=/,
        /bit\.ly/,
        /tinyurl\.com/,
        /go\./,
        /ref=/,
        /affiliate/
      ]
    },
    youtube: {
      patterns: [
        /youtube\.com\/watch/,
        /youtu\.be/,
        /youtube\.com\/playlist/
      ]
    },
    support: {
      patterns: [
        /patreon\.com/,
        /ko-fi\.com/,
        /buymeacoffee\.com/,
        /paypal\.me/
      ],
      platforms: {
        'patreon.com': 'Patreon',
        'ko-fi.com': 'Ko-fi',
        'buymeacoffee.com': 'Buy Me a Coffee',
        'paypal.me': 'PayPal'
      }
    }
  };

  urls.forEach((url, index) => {
    const position = text.indexOf(url);
    let category = 'website';
    let platform = null;

    // Check categories
    for (const [catName, catData] of Object.entries(categories)) {
      if (catData.patterns.some(pattern => pattern.test(url))) {
        category = catName;

        // Get platform if available
        if (catData.platforms) {
          for (const [domain, platName] of Object.entries(catData.platforms)) {
            if (url.includes(domain)) {
              platform = platName;
              break;
            }
          }
        }
        break;
      }
    }

    // Extract link text/context
    const beforeText = text.substring(Math.max(0, position - 50), position);
    const afterText = text.substring(position + url.length, Math.min(text.length, position + url.length + 50));
    const context = (beforeText + ' ' + afterText).trim();

    links.push({
      url,
      text: context.substring(0, 100),
      position,
      category,
      platform,
      is_affiliate: category === 'affiliate' || /ref=|affiliate/.test(url)
    });
  });

  // Group by category
  const categories_data = {};
  links.forEach(link => {
    if (!categories_data[link.category]) {
      categories_data[link.category] = [];
    }
    categories_data[link.category].push(link);
  });

  // Link placement analysis
  const linkPlacement = {
    first_100_chars: links.filter(l => l.position < 100).length,
    first_500_chars: links.filter(l => l.position < 500).length,
    middle_section: links.filter(l => l.position >= 500 && l.position < text.length - 500).length,
    last_500_chars: links.filter(l => l.position >= text.length - 500).length
  };

  return {
    total_links: links.length,
    links,
    categories: categories_data,
    link_placement: linkPlacement,
    link_density: text.length > 0 ? links.length / (text.length / 1000) : 0
  };
}

// Extract keywords
function parseKeywords(text, title = '') {
  // Get first 2-3 sentences (SEO focus)
  const firstSentences = text.split(/[.!?]+/).slice(0, 3).join(' ');
  const firstParagraph = text.split('\n\n')[0] || '';

  // Simple keyword extraction (common words, phrases)
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Get top keywords
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: count / words.length
    }));

  // Check title overlap
  const titleWords = title.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const titleOverlap = topKeywords.filter(kw => titleWords.includes(kw.word));

  // SEO scoring
  const firstSentenceOptimization = firstSentences.length > 100 ? 9 : firstSentences.length > 50 ? 7 : 5;
  const keywordPlacement = topKeywords.some(kw => firstSentences.toLowerCase().includes(kw.word)) ? 8 : 5;
  const titleMatch = titleOverlap.length > 0 ? 8 : 5;
  const keywordDensity = topKeywords[0]?.density > 0.02 && topKeywords[0]?.density < 0.1 ? 8 : 5;

  const overallSeoScore = (firstSentenceOptimization + keywordPlacement + titleMatch + keywordDensity) / 4;

  return {
    primary_keywords: {
      first_sentence: firstSentences.split(/\s+/).slice(0, 5),
      first_paragraph: firstParagraph.split(/\s+/).slice(0, 10),
      title_overlap: titleOverlap.map(kw => kw.word)
    },
    keyword_density: topKeywords.reduce((acc, kw) => {
      acc[kw.word] = {
        count: kw.count,
        density: kw.density,
        positions: []
      };
      return acc;
    }, {}),
    seo_analysis: {
      first_sentence_optimization: firstSentenceOptimization,
      keyword_placement_score: keywordPlacement,
      title_description_match: titleMatch,
      overall_seo_score: overallSeoScore
    },
    keyword_phrases: topKeywords.slice(0, 5).map(kw => ({
      phrase: kw.word,
      count: kw.count,
      importance: kw.density > 0.05 ? 'high' : kw.density > 0.02 ? 'medium' : 'low'
    }))
  };
}

// Extract CTAs
function parseCTAs(text) {
  const ctaPatterns = {
    subscribe: /(?:subscribe|sub|hit subscribe|subscribe for more)/gi,
    like_comment: /(?:like|comment|thumbs up|let me know|tell me)/gi,
    website: /(?:visit|check out|go to|website|site)/gi,
    social: /(?:follow|connect|join|find me on)/gi,
    support: /(?:support|patreon|donate|buy me a coffee|back me)/gi,
    watch_more: /(?:watch|see more|next video|playlist|more videos)/gi
  };

  const ctas = [];

  Object.entries(ctaPatterns).forEach(([type, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const position = match.index;
      const contextStart = Math.max(0, position - 30);
      const contextEnd = Math.min(text.length, position + 100);
      const context = text.substring(contextStart, contextEnd);
      const ctaText = context.substring(context.indexOf(match[0]), Math.min(100, context.length));

      // Effectiveness scoring
      let effectiveness = 5; // base
      if (position < 100) effectiveness += 2; // early placement
      if (position < 500) effectiveness += 1; // early-mid placement
      if (/[!🎉🔥💪]/.test(context)) effectiveness += 1; // has emoji
      if (/https?:\/\//.test(context)) effectiveness += 1; // has link
      if (ctaText.length < 50) effectiveness += 1; // concise

      ctas.push({
        text: ctaText.trim(),
        type,
        position,
        effectiveness: Math.min(10, effectiveness),
        has_emoji: /[🎉🔥💪⭐]/.test(context),
        has_link: /https?:\/\//.test(context),
        context: context.trim()
      });
    });
  });

  // Remove duplicates (same type, similar position)
  const uniqueCTAs = [];
  ctas.forEach(cta => {
    const existing = uniqueCTAs.find(u =>
      u.type === cta.type && Math.abs(u.position - cta.position) < 50
    );
    if (!existing) uniqueCTAs.push(cta);
  });

  // Distribution
  const distribution = {};
  uniqueCTAs.forEach(cta => {
    distribution[cta.type] = (distribution[cta.type] || 0) + 1;
  });

  // Placement analysis
  const placement = {
    first_100_chars: uniqueCTAs.filter(c => c.position < 100).length,
    first_500_chars: uniqueCTAs.filter(c => c.position < 500).length,
    middle: uniqueCTAs.filter(c => c.position >= 500 && c.position < text.length - 500).length,
    end: uniqueCTAs.filter(c => c.position >= text.length - 500).length
  };

  const avgEffectiveness = uniqueCTAs.length > 0
    ? uniqueCTAs.reduce((sum, c) => sum + c.effectiveness, 0) / uniqueCTAs.length
    : 0;

  return {
    total_ctas: uniqueCTAs.length,
    ctas: uniqueCTAs.sort((a, b) => a.position - b.position),
    cta_distribution: distribution,
    cta_placement: placement,
    cta_effectiveness_score: avgEffectiveness
  };
}

// Extract timestamps
function parseTimestamps(text) {
  const timestampPattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(.+?)(?=\n|$|\d{1,2}:\d{2})/g;
  const timestamps = [];
  let match;

  while ((match = timestampPattern.exec(text)) !== null) {
    const hours = match[3] ? parseInt(match[1]) : 0;
    const minutes = parseInt(match[3] ? match[2] : match[1]);
    const seconds = parseInt(match[3] ? match[3] : match[2]);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const title = match[4]?.trim() || '';

    timestamps.push({
      time: match[0].split(/\s+/)[0],
      seconds: totalSeconds,
      title: title.substring(0, 100),
      position: match.index,
      has_keywords: title.split(/\s+/).length > 2
    });
  }

  // Chapter analysis
  let avgChapterLength = 0;
  if (timestamps.length > 1) {
    const durations = [];
    for (let i = 0; i < timestamps.length - 1; i++) {
      durations.push(timestamps[i + 1].seconds - timestamps[i].seconds);
    }
    avgChapterLength = durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  return {
    total_timestamps: timestamps.length,
    has_chapters: timestamps.length > 0,
    timestamps,
    chapter_analysis: {
      average_chapter_length: `${Math.floor(avgChapterLength / 60)}:${Math.floor(avgChapterLength % 60).toString().padStart(2, '0')}`,
      total_video_coverage: timestamps.length > 0 ? timestamps[timestamps.length - 1].time : '0:00',
      keyword_usage: timestamps.filter(t => t.has_keywords).length,
      seo_value: timestamps.length > 3 ? 'high' : timestamps.length > 0 ? 'medium' : 'low'
    }
  };
}

// Extract contact info
function parseContact(text) {
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  const emails = (text.match(emailPattern) || []).map(email => ({
    email,
    position: text.indexOf(email),
    context: text.substring(Math.max(0, text.indexOf(email) - 30), Math.min(text.length, text.indexOf(email) + 50))
  }));

  // Social handles
  const socialHandles = {};
  const handlePatterns = {
    twitter: /(?:twitter|@)(?:\.com\/)?@?(\w+)/gi,
    instagram: /(?:instagram|@)(?:\.com\/)?@?(\w+)/gi,
    discord: /discord(?:\.gg|\.com)?\/?(\w+)/gi
  };

  Object.entries(handlePatterns).forEach(([platform, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      socialHandles[platform] = `@${matches[0][1]}`;
    }
  });

  // Main website (first non-YouTube, non-social URL)
  const urlPattern = /https?:\/\/(?!youtube|youtu|twitter|instagram|facebook|tiktok|discord|reddit|linkedin)([^\s\)]+)/;
  const websiteMatch = text.match(urlPattern);
  const website = websiteMatch ? {
    url: websiteMatch[0],
    is_main: true
  } : null;

  // Contact section detection
  const contactKeywords = /contact|reach|email|follow|connect|find me/gi;
  const hasContactSection = contactKeywords.test(text);
  const contactSectionPos = hasContactSection ? text.search(contactKeywords) : -1;

  return {
    emails,
    social_handles: socialHandles,
    website,
    contact_section: {
      exists: hasContactSection,
      position: contactSectionPos,
      formatting: contactSectionPos > -1 ? 'organized' : 'none'
    }
  };
}

// Analyze monetization
function parseMonetization(text, links) {
  const affiliateLinks = links.filter(l => l.category === 'affiliate' || l.is_affiliate);
  const supportLinks = links.filter(l => l.category === 'support');

  // Sponsor mentions
  const sponsorPatterns = [
    /sponsored by/gi,
    /thanks to.*for sponsoring/gi,
    /this video is sponsored/gi
  ];
  const sponsorMentions = [];
  sponsorPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      sponsorMentions.push({
        text: text.substring(Math.max(0, match.index - 20), Math.min(text.length, match.index + 100)),
        position: match.index
      });
    });
  });

  // Product links (non-affiliate, non-social)
  const productLinks = links.filter(l =>
    l.category === 'website' &&
    !l.url.includes('patreon') &&
    !l.url.includes('ko-fi')
  );

  // Revenue streams
  const revenueStreams = [];
  if (affiliateLinks.length > 0) revenueStreams.push('affiliate');
  if (sponsorMentions.length > 0) revenueStreams.push('sponsors');
  if (supportLinks.length > 0) revenueStreams.push('support');
  if (productLinks.length > 0) revenueStreams.push('products');

  // Strategy assessment
  let strategy = 'none';
  if (affiliateLinks.length > 2 && supportLinks.length > 0) {
    strategy = 'affiliate + support';
  } else if (affiliateLinks.length > 2) {
    strategy = 'affiliate';
  } else if (supportLinks.length > 0) {
    strategy = 'support';
  } else if (sponsorMentions.length > 0) {
    strategy = 'sponsors';
  }

  return {
    affiliate_links: {
      count: affiliateLinks.length,
      links: affiliateLinks,
      strategy: affiliateLinks.length > 3 ? 'aggressive' : affiliateLinks.length > 0 ? 'moderate' : 'none'
    },
    sponsor_mentions: {
      count: sponsorMentions.length,
      mentions: sponsorMentions
    },
    product_links: {
      count: productLinks.length,
      links: productLinks
    },
    support_links: {
      count: supportLinks.length,
      platforms: [...new Set(supportLinks.map(l => l.platform).filter(Boolean))],
      links: supportLinks
    },
    monetization_strategy: strategy,
    revenue_streams: revenueStreams
  };
}

// Generate strategic insights
function generateInsights(descriptionAnalysis, basicMetrics) {
  const { structure, keywords, links, ctas, timestamps, contact, monetization } = descriptionAnalysis;

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // Description quality
  let quality = 'medium';
  if (structure.total_length > 500 && keywords.seo_analysis.overall_seo_score > 7) {
    quality = 'high';
  } else if (structure.total_length < 200) {
    quality = 'low';
  }

  // SEO optimization
  let seoLevel = 'good';
  if (keywords.seo_analysis.overall_seo_score > 8) {
    seoLevel = 'excellent';
    strengths.push('Strong SEO optimization with good keyword placement');
  } else if (keywords.seo_analysis.overall_seo_score < 6) {
    seoLevel = 'poor';
    weaknesses.push('Weak SEO optimization - keywords not well placed');
    recommendations.push('Add more keywords to first sentence and improve title-description match');
  }

  // Link strategy
  let linkStrategy = 'moderate';
  if (links.total_links > 8) {
    linkStrategy = 'aggressive';
    strengths.push('Aggressive link strategy with multiple monetization channels');
  } else if (links.total_links < 3) {
    linkStrategy = 'conservative';
    weaknesses.push('Limited link usage - missing monetization opportunities');
    recommendations.push('Consider adding more links (social, website, support)');
  }

  // CTA effectiveness
  let ctaEffectiveness = 'good';
  if (ctas.total_ctas > 4 && ctas.cta_effectiveness_score > 7) {
    ctaEffectiveness = 'excellent';
    strengths.push('Strong CTA strategy with good placement');
  } else if (ctas.total_ctas < 2) {
    ctaEffectiveness = 'poor';
    weaknesses.push('Limited CTAs - missing conversion opportunities');
    recommendations.push('Add more CTAs (subscribe, website visit, social follow)');
  }

  // Timestamps
  if (timestamps.has_chapters && timestamps.total_timestamps > 3) {
    strengths.push('Good use of timestamps/chapters for SEO');
  } else if (!timestamps.has_chapters) {
    recommendations.push('Consider adding timestamps/chapters for better SEO');
  }

  // Monetization
  if (monetization.revenue_streams.length > 1) {
    strengths.push(`Multiple revenue streams: ${monetization.revenue_streams.join(', ')}`);
  }

  // Link placement
  if (links.link_placement.first_500_chars > 3) {
    weaknesses.push('Too many links in first 500 characters - may hurt SEO');
    recommendations.push('Move some links to end of description');
  }

  return {
    description_quality: quality,
    seo_optimization: seoLevel,
    link_strategy: linkStrategy,
    cta_effectiveness: ctaEffectiveness,
    monetization_strategy: monetization.monetization_strategy,
    strengths,
    weaknesses,
    recommendations
  };
}

// Export all functions
export {
  extractVideoId,
  parseStructure,
  parseLinks,
  parseKeywords,
  parseCTAs,
  parseTimestamps,
  parseContact,
  parseMonetization,
  generateInsights
};
