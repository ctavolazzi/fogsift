#!/usr/bin/env node
import { execSync } from 'child_process';
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

const url = 'https://www.youtube.com/watch?v=ehOHUUIh0Fo';
const videoId = extractVideoId(url);

console.log(`Testing with: ${url}`);
console.log(`Video ID: ${videoId}\n`);

// Sample description for testing (from what we extracted earlier)
const description = `How to build a realistic, miniature, fantasy Tavern diorama from scratch from balsa wood and styrofoam. This scale model is in 1/24 scale.

Patreon: https://www.patreon.com/SmolWorldWorkshop

Please subscribe for more miniature builds and tutorials!

Follow me on Instagram: https://www.instagram.com/smolworldworkshop/

Music by Epidemic Sound: https://www.epidemicsound.com/referral/8x1c8m/

#miniature #diorama #tavern #scale #model #balsawood #styrofoam #fantasy #tutorial`;

const title = 'How to Build a Miniature Fantasy Tavern Diorama';

console.log(`📝 Description: ${description.substring(0, 100)}...\n`);

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
  viewCount: 0,
  likeCount: 0,
  commentCount: 0
});

// Output
console.log('📊 ANALYSIS RESULTS\n');
console.log('📐 STRUCTURE:');
console.log(`  Length: ${descriptionAnalysis.structure.total_length} chars, ${descriptionAnalysis.structure.word_count} words`);
console.log(`  Sections: ${descriptionAnalysis.structure.sections.length}`);
console.log(`  Above-the-fold: "${descriptionAnalysis.structure.above_the_fold.text.substring(0, 100)}..."`);
console.log(`  SEO Optimized: ${descriptionAnalysis.structure.above_the_fold.is_optimized ? '✅' : '❌'}\n`);

console.log('🔑 KEYWORDS & SEO:');
console.log(`  Primary Keywords: ${descriptionAnalysis.keywords.primary_keywords.first_sentence.slice(0, 5).join(', ')}`);
console.log(`  SEO Score: ${descriptionAnalysis.keywords.seo_analysis.overall_seo_score.toFixed(1)}/10\n`);

console.log('🔗 LINKS:');
console.log(`  Total: ${descriptionAnalysis.links.total_links}`);
Object.entries(descriptionAnalysis.links.categories).forEach(([category, links]) => {
  if (links && links.length > 0) {
    console.log(`  ${category}: ${links.length}`);
    links.forEach(link => {
      console.log(`    - ${link.url} (${link.platform || 'N/A'})`);
    });
  }
});
console.log('');

console.log('📢 CTAs:');
console.log(`  Total: ${descriptionAnalysis.ctas.total_ctas}`);
descriptionAnalysis.ctas.ctas.forEach(cta => {
  console.log(`  [${cta.type}] "${cta.text.substring(0, 50)}..." (${cta.effectiveness}/10)`);
});
console.log('');

console.log('💰 MONETIZATION:');
console.log(`  Strategy: ${descriptionAnalysis.monetization.monetization_strategy}`);
console.log(`  Revenue Streams: ${descriptionAnalysis.monetization.revenue_streams.join(', ')}`);
console.log(`  Affiliate Links: ${descriptionAnalysis.monetization.affiliate_links.count}`);
console.log(`  Support Links: ${descriptionAnalysis.monetization.support_links.count} (${descriptionAnalysis.monetization.support_links.platforms.join(', ')})`);
console.log('');

console.log('💡 INSIGHTS:');
console.log(`  Description Quality: ${insights.description_quality}`);
console.log(`  SEO Optimization: ${insights.seo_optimization}`);
console.log(`  Link Strategy: ${insights.link_strategy}`);
console.log(`  CTA Effectiveness: ${insights.cta_effectiveness}`);
console.log('');
console.log('✅ STRENGTHS:');
insights.strengths.forEach(s => console.log(`  • ${s}`));
console.log('');
console.log('💡 RECOMMENDATIONS:');
insights.recommendations.forEach(r => console.log(`  • ${r}`));
