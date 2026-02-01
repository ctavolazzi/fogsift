#!/usr/bin/env node
import fs from 'fs';
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

// Load data from Python extraction
const data = JSON.parse(fs.readFileSync('/tmp/youtube_data.json', 'utf8'));

const url = 'https://www.youtube.com/watch?v=ehOHUUIh0Fo';
const videoId = extractVideoId(url);
const { description, title, channel, views } = data;

console.log(`📊 YouTube Video Analysis\n`);
console.log(`${'═'.repeat(60)}\n`);

console.log(`📹 BASIC METRICS\n`);
console.log(`${'─'.repeat(60)}`);
console.log(`Channel: ${channel || 'N/A'}`);
console.log(`Title: ${title || 'N/A'}`);
console.log(`Views: ${views.toLocaleString() || 'N/A'}`);
console.log(`Video ID: ${videoId}\n`);

console.log(`📝 DESCRIPTION ANALYSIS (KEY FOCUS)\n`);
console.log(`${'─'.repeat(60)}\n`);

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
  viewCount: views,
  likeCount: 0,
  commentCount: 0
});

// Structure
console.log(`📐 STRUCTURE`);
console.log(`  Length: ${descriptionAnalysis.structure.total_length} chars, ${descriptionAnalysis.structure.word_count} words`);
console.log(`  Sections: ${descriptionAnalysis.structure.sections.length}`);
console.log(`  Above-the-fold (first 2-3 sentences):`);
console.log(`    "${descriptionAnalysis.structure.above_the_fold.text.substring(0, 150)}..."`);
console.log(`    SEO Optimized: ${descriptionAnalysis.structure.above_the_fold.is_optimized ? '✅ Yes' : '❌ No'}\n`);

// Keywords
console.log(`🔑 KEYWORDS & SEO`);
console.log(`  Primary Keywords: ${descriptionAnalysis.keywords.primary_keywords.first_sentence.slice(0, 5).join(', ')}`);
console.log(`  SEO Score: ${descriptionAnalysis.keywords.seo_analysis.overall_seo_score.toFixed(1)}/10`);
console.log(`  First Sentence Optimization: ${descriptionAnalysis.keywords.seo_analysis.first_sentence_optimization}/10`);
console.log(`  Title Match: ${descriptionAnalysis.keywords.seo_analysis.title_description_match}/10\n`);

// Links
console.log(`🔗 LINKS (${descriptionAnalysis.links.total_links} total)`);
Object.entries(descriptionAnalysis.links.categories).forEach(([category, links]) => {
  if (links && links.length > 0) {
    console.log(`  ${category}: ${links.length}`);
    links.slice(0, 3).forEach(link => {
      console.log(`    - ${link.url.substring(0, 70)}${link.url.length > 70 ? '...' : ''}`);
    });
  }
});
console.log(`  Link Placement:`);
console.log(`    First 500 chars: ${descriptionAnalysis.links.link_placement.first_500_chars}`);
console.log(`    Middle: ${descriptionAnalysis.links.link_placement.middle_section}`);
console.log(`    End: ${descriptionAnalysis.links.link_placement.last_500_chars}\n`);

// CTAs
console.log(`📢 CALLS TO ACTION (${descriptionAnalysis.ctas.total_ctas} total)`);
descriptionAnalysis.ctas.ctas.slice(0, 5).forEach(cta => {
  console.log(`  [${cta.type}] "${cta.text.substring(0, 60)}..." (Effectiveness: ${cta.effectiveness}/10)`);
});
console.log(`  Average Effectiveness: ${descriptionAnalysis.ctas.cta_effectiveness_score.toFixed(1)}/10\n`);

// Timestamps
if (descriptionAnalysis.timestamps.has_chapters) {
  console.log(`⏱️  TIMESTAMPS/CHAPTERS (${descriptionAnalysis.timestamps.total_timestamps} total)`);
  console.log(`  SEO Value: ${descriptionAnalysis.timestamps.chapter_analysis.seo_value}`);
  descriptionAnalysis.timestamps.timestamps.slice(0, 5).forEach(ts => {
    console.log(`    ${ts.time} - ${ts.title.substring(0, 50)}`);
  });
  console.log('');
}

// Monetization
console.log(`💰 MONETIZATION STRATEGY`);
console.log(`  Strategy: ${descriptionAnalysis.monetization.monetization_strategy}`);
console.log(`  Revenue Streams: ${descriptionAnalysis.monetization.revenue_streams.join(', ') || 'None detected'}`);
console.log(`  Affiliate Links: ${descriptionAnalysis.monetization.affiliate_links.count}`);
console.log(`  Support Links: ${descriptionAnalysis.monetization.support_links.count} (${descriptionAnalysis.monetization.support_links.platforms.join(', ') || 'None'})`);
console.log(`  Sponsor Mentions: ${descriptionAnalysis.monetization.sponsor_mentions.count}\n`);

// Strategic Insights
console.log(`💡 STRATEGIC INSIGHTS`);
console.log(`${'─'.repeat(60)}`);
console.log(`Description Quality: ${insights.description_quality}`);
console.log(`SEO Optimization: ${insights.seo_optimization}`);
console.log(`Link Strategy: ${insights.link_strategy}`);
console.log(`CTA Effectiveness: ${insights.cta_effectiveness}\n`);

if (insights.strengths.length > 0) {
  console.log(`✅ STRENGTHS:`);
  insights.strengths.forEach(s => console.log(`  • ${s}`));
  console.log('');
}

if (insights.weaknesses.length > 0) {
  console.log(`⚠️  WEAKNESSES:`);
  insights.weaknesses.forEach(w => console.log(`  • ${w}`));
  console.log('');
}

if (insights.recommendations.length > 0) {
  console.log(`💡 RECOMMENDATIONS:`);
  insights.recommendations.forEach(r => console.log(`  • ${r}`));
}

// Save full JSON
const structuredData = {
  video_id: videoId,
  url,
  basic_metrics: {
    channel_name: channel,
    video_title: title,
    view_count: views,
    like_count: 0,
    comment_count: 0,
    upload_date: '',
    duration: ''
  },
  description_analysis: {
    raw_description: description,
    ...descriptionAnalysis
  },
  strategic_insights: insights
};

const outputPath = `/Users/ctavolazzi/Code/fogsift/content/tech-teardowns/analyses/youtube-analysis-${videoId}-${Date.now()}.json`;
fs.mkdirSync('/Users/ctavolazzi/Code/fogsift/content/tech-teardowns/analyses', { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(structuredData, null, 2));
console.log(`\n${'═'.repeat(60)}`);
console.log(`📁 Full analysis saved to: ${outputPath}`);
