#!/usr/bin/env node
/**
 * Test script for YouTube analyzer
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  extractVideoId,
  parseStructure,
  parseLinks,
  parseKeywords,
  parseCTAs,
  parseTimestamps,
  parseContact,
  parseMonetization,
  generateInsights
} from './youtube-parser.js';

const url = process.argv[2] || 'https://www.youtube.com/watch?v=ehOHUUIh0Fo';
const videoId = extractVideoId(url);

console.log(`Testing YouTube Analyzer with: ${url}`);
console.log(`Video ID: ${videoId}\n`);

// Try to get video data
let description = '';
let title = '';
let channelName = '';
let viewCount = 0;
let likeCount = 0;
let commentCount = 0;
let uploadDate = '';
let duration = '';

// Try yt-dlp first
try {
  const ytdlpResult = execSync(`yt-dlp --dump-json --no-warnings "${url}" 2>/dev/null`, { encoding: 'utf8' });
  const videoData = JSON.parse(ytdlpResult);
  description = videoData.description || '';
  title = videoData.title || '';
  channelName = videoData.uploader || videoData.channel || '';
  viewCount = videoData.view_count || 0;
  likeCount = videoData.like_count || 0;
  commentCount = videoData.comment_count || 0;
  uploadDate = videoData.upload_date ?
    `${videoData.upload_date.substring(0,4)}-${videoData.upload_date.substring(4,6)}-${videoData.upload_date.substring(6,8)}` : '';
  duration = videoData.duration_string || '';
  console.log('✅ Using yt-dlp (complete data)');
} catch (e) {
  // Fallback to HTML scraping
  console.log('⚠️  yt-dlp not available, using HTML scraping');
  try {
    const html = execSync(`curl -sL "${url}"`, { encoding: 'utf8' });

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1].replace(' - YouTube', '').trim();
    }

    const descMatch = html.match(/"shortDescription":"([^"]+)"/);
    if (descMatch) {
      description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/);
    if (channelMatch) {
      channelName = channelMatch[1];
    }

    const viewMatch = html.match(/"viewCount":"(\d+)"/);
    if (viewMatch) {
      viewCount = parseInt(viewMatch[1]);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (!description) {
  console.error('❌ Could not extract description');
  process.exit(1);
}

console.log(`\n📝 Description length: ${description.length} chars`);
console.log(`📝 Description preview: ${description.substring(0, 100)}...\n`);

// Parse description
const descriptionAnalysis = {
  structure: parseStructure(description),
  keywords: parseKeywords(description, title),
  links: parseLinks(description),
  ctas: parseCTAs(description),
  timestamps: parseTimestamps(description),
  contact: parseContact(description),
  monetization: parseMonetization(description, parseLinks(description).links)
};

const insights = generateInsights(descriptionAnalysis, {
  viewCount,
  likeCount,
  commentCount
});

// Format output
let output = `📊 YouTube Video Analysis\n`;
output += `${'═'.repeat(60)}\n\n`;

output += `📹 BASIC METRICS\n`;
output += `${'─'.repeat(60)}\n`;
output += `Channel: ${channelName || 'N/A'}\n`;
output += `Title: ${title || 'N/A'}\n`;
output += `Views: ${viewCount.toLocaleString() || 'N/A'}\n`;
output += `Likes: ${likeCount.toLocaleString() || 'N/A'}\n`;
output += `Comments: ${commentCount.toLocaleString() || 'N/A'}\n`;
output += `Upload Date: ${uploadDate || 'N/A'}\n`;
output += `Duration: ${duration || 'N/A'}\n`;
output += `Video ID: ${videoId}\n\n`;

output += `📝 DESCRIPTION ANALYSIS (KEY FOCUS)\n`;
output += `${'─'.repeat(60)}\n\n`;

output += `📐 STRUCTURE\n`;
output += `  Length: ${descriptionAnalysis.structure.total_length} chars, ${descriptionAnalysis.structure.word_count} words\n`;
output += `  Sections: ${descriptionAnalysis.structure.sections.length}\n`;
output += `  Above-the-fold (first 2-3 sentences):\n`;
output += `    "${descriptionAnalysis.structure.above_the_fold.text.substring(0, 150)}..."\n`;
output += `    SEO Optimized: ${descriptionAnalysis.structure.above_the_fold.is_optimized ? '✅ Yes' : '❌ No'}\n\n`;

output += `🔑 KEYWORDS & SEO\n`;
output += `  Primary Keywords: ${descriptionAnalysis.keywords.primary_keywords.first_sentence.slice(0, 5).join(', ')}\n`;
output += `  SEO Score: ${descriptionAnalysis.keywords.seo_analysis.overall_seo_score.toFixed(1)}/10\n`;
output += `  First Sentence Optimization: ${descriptionAnalysis.keywords.seo_analysis.first_sentence_optimization}/10\n`;
output += `  Title Match: ${descriptionAnalysis.keywords.seo_analysis.title_description_match}/10\n\n`;

output += `🔗 LINKS (${descriptionAnalysis.links.total_links} total)\n`;
Object.entries(descriptionAnalysis.links.categories).forEach(([category, links]) => {
  if (links && links.length > 0) {
    output += `  ${category}: ${links.length}\n`;
    links.slice(0, 3).forEach(link => {
      output += `    - ${link.url.substring(0, 60)}${link.url.length > 60 ? '...' : ''}\n`;
    });
  }
});
output += `  Link Placement:\n`;
output += `    First 500 chars: ${descriptionAnalysis.links.link_placement.first_500_chars}\n`;
output += `    Middle: ${descriptionAnalysis.links.link_placement.middle_section}\n`;
output += `    End: ${descriptionAnalysis.links.link_placement.last_500_chars}\n\n`;

output += `📢 CALLS TO ACTION (${descriptionAnalysis.ctas.total_ctas} total)\n`;
descriptionAnalysis.ctas.ctas.slice(0, 5).forEach(cta => {
  output += `  [${cta.type}] "${cta.text.substring(0, 50)}..." (Effectiveness: ${cta.effectiveness}/10)\n`;
});
output += `  Average Effectiveness: ${descriptionAnalysis.ctas.cta_effectiveness_score.toFixed(1)}/10\n\n`;

if (descriptionAnalysis.timestamps.has_chapters) {
  output += `⏱️  TIMESTAMPS/CHAPTERS (${descriptionAnalysis.timestamps.total_timestamps} total)\n`;
  output += `  SEO Value: ${descriptionAnalysis.timestamps.chapter_analysis.seo_value}\n`;
  descriptionAnalysis.timestamps.timestamps.slice(0, 5).forEach(ts => {
    output += `    ${ts.time} - ${ts.title.substring(0, 40)}\n`;
  });
  output += `\n`;
}

output += `💰 MONETIZATION STRATEGY\n`;
output += `  Strategy: ${descriptionAnalysis.monetization.monetization_strategy}\n`;
output += `  Revenue Streams: ${descriptionAnalysis.monetization.revenue_streams.join(', ') || 'None detected'}\n`;
output += `  Affiliate Links: ${descriptionAnalysis.monetization.affiliate_links.count}\n`;
output += `  Support Links: ${descriptionAnalysis.monetization.support_links.count} (${descriptionAnalysis.monetization.support_links.platforms.join(', ') || 'None'})\n`;
output += `  Sponsor Mentions: ${descriptionAnalysis.monetization.sponsor_mentions.count}\n\n`;

output += `💡 STRATEGIC INSIGHTS\n`;
output += `${'─'.repeat(60)}\n`;
output += `Description Quality: ${insights.description_quality}\n`;
output += `SEO Optimization: ${insights.seo_optimization}\n`;
output += `Link Strategy: ${insights.link_strategy}\n`;
output += `CTA Effectiveness: ${insights.cta_effectiveness}\n\n`;

if (insights.strengths.length > 0) {
  output += `✅ STRENGTHS:\n`;
  insights.strengths.forEach(s => output += `  • ${s}\n`);
  output += `\n`;
}

if (insights.weaknesses.length > 0) {
  output += `⚠️  WEAKNESSES:\n`;
  insights.weaknesses.forEach(w => output += `  • ${w}\n`);
  output += `\n`;
}

if (insights.recommendations.length > 0) {
  output += `💡 RECOMMENDATIONS:\n`;
  insights.recommendations.forEach(r => output += `  • ${r}\n`);
}

console.log(output);

// Save JSON
const structuredData = {
  video_id: videoId,
  url,
  basic_metrics: {
    channel_name: channelName,
    video_title: title,
    view_count: viewCount,
    like_count: likeCount,
    comment_count: commentCount,
    upload_date: uploadDate,
    duration
  },
  description_analysis: {
    raw_description: description,
    ...descriptionAnalysis
  },
  strategic_insights: insights
};

const outputPath = path.join(process.cwd(), `youtube-analysis-${videoId}-${Date.now()}.json`);
fs.writeFileSync(outputPath, JSON.stringify(structuredData, null, 2));
console.log(`\n📁 Full analysis saved to: ${outputPath}`);
