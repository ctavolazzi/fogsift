# YouTube Keyword Analysis - Design Document

**Purpose**: Analyze popular YouTube videos related to a search term/keyword to understand what works in that niche.

---

## Concept

### Input
- **Search Term/Keyword**: e.g., "tech teardown", "vintage computer", "gadget review"
- **Analysis Depth**: Number of videos to analyze (default: 10, max: 50)

### Output
- **Aggregated Analysis**: Patterns across top videos
- **Best Practices**: What successful videos do
- **Common Strategies**: SEO, monetization, CTAs
- **Opportunities**: Gaps and opportunities
- **Individual Analyses**: Each video analyzed in detail

---

## Workflow

### Step 1: Search YouTube
- Search for keyword/term
- Get top results (sorted by relevance/views)
- Extract video URLs

### Step 2: Analyze Each Video
- Run `fogsift_youtube_analyze` on each video
- Collect all analyses

### Step 3: Aggregate Insights
- Find common patterns
- Identify best practices
- Calculate averages
- Find outliers

### Step 4: Generate Strategic Report
- What works in this niche
- Common SEO strategies
- Monetization patterns
- Content structure patterns
- Recommendations

---

## Data to Aggregate

### Description Patterns
- **Average Length**: Average description length
- **Common Keywords**: Most used keywords across videos
- **Link Strategies**: How many links, where placed
- **CTA Patterns**: Most common CTAs
- **Timestamp Usage**: How many use timestamps

### SEO Patterns
- **Average SEO Score**: Average across all videos
- **Keyword Placement**: Where keywords appear
- **Title Patterns**: Common title structures
- **Above-the-fold**: What top videos put first

### Monetization Patterns
- **Revenue Streams**: What monetization methods used
- **Affiliate Usage**: How many use affiliate links
- **Support Platforms**: Which platforms popular
- **Sponsor Frequency**: How often sponsors mentioned

### Content Patterns
- **Video Lengths**: Average, range
- **View Counts**: Performance metrics
- **Engagement**: Likes, comments patterns

---

## Implementation Approach

### Option 1: YouTube Data API v3 (Official)
**Endpoint**: `search.list`
- Search by keyword
- Get video IDs
- Then analyze each

**Pros**: Official, reliable, good data
**Cons**: Requires API key, quota limits

### Option 2: yt-dlp Search
**Command**: `yt-dlp "ytsearch10:keyword" --dump-json`
- Search and get results
- Extract video IDs
- Then analyze each

**Pros**: No API key, comprehensive
**Cons**: May be slower

### Option 3: HTML Scraping
**Method**: Scrape YouTube search results page
- Extract video URLs
- Then analyze each

**Pros**: No API key needed
**Cons**: Less reliable, may break

---

## Aggregation Functions

### Pattern Detection
```javascript
function aggregateDescriptionPatterns(analyses) {
  return {
    avg_length: average(analyses.map(a => a.description_analysis.structure.total_length)),
    avg_sections: average(analyses.map(a => a.description_analysis.structure.sections.length)),
    common_keywords: findCommonKeywords(analyses),
    link_strategies: aggregateLinkStrategies(analyses),
    cta_patterns: aggregateCTAPatterns(analyses)
  };
}
```

### Best Practices Extraction
```javascript
function extractBestPractices(analyses) {
  // Find videos with highest SEO scores
  // Find videos with best engagement
  // Find common patterns in top performers
  return {
    top_seo_videos: [...],
    top_engagement_videos: [...],
    common_patterns: {...}
  };
}
```

### Opportunity Identification
```javascript
function identifyOpportunities(analyses) {
  // Find what most videos do
  // Find what few videos do (opportunity)
  // Find gaps
  return {
    underserved_keywords: [...],
    missing_monetization: [...],
    content_gaps: [...]
  };
}
```

---

## Output Structure

### Aggregated Report
```json
{
  "keyword": "tech teardown",
  "videos_analyzed": 10,
  "aggregated_insights": {
    "description_patterns": {...},
    "seo_patterns": {...},
    "monetization_patterns": {...},
    "content_patterns": {...}
  },
  "best_practices": {
    "top_performers": [...],
    "common_patterns": {...},
    "seo_strategies": [...]
  },
  "opportunities": {
    "underserved_keywords": [...],
    "missing_strategies": [...],
    "content_gaps": [...]
  },
  "individual_analyses": [...]
}
```

---

## Use Cases

### 1. Niche Research
- Search: "tech teardown"
- Analyze top 10 videos
- Learn what works in this niche

### 2. Competitor Analysis
- Search: Your niche keywords
- Analyze competitors
- Identify strategies

### 3. Content Strategy
- Search: Related keywords
- Find content gaps
- Identify opportunities

### 4. SEO Research
- Search: Target keywords
- See how top videos optimize
- Learn SEO strategies

---

## Implementation Plan

### Phase 1: Search Functionality
- [ ] Implement YouTube search (API or yt-dlp)
- [ ] Extract video URLs from results
- [ ] Limit to top N results

### Phase 2: Batch Analysis
- [ ] Analyze each video
- [ ] Collect all analyses
- [ ] Handle errors gracefully

### Phase 3: Aggregation
- [ ] Aggregate description patterns
- [ ] Aggregate SEO patterns
- [ ] Aggregate monetization patterns

### Phase 4: Insights Generation
- [ ] Identify best practices
- [ ] Find opportunities
- [ ] Generate recommendations

### Phase 5: Report Generation
- [ ] Format aggregated report
- [ ] Save individual analyses
- [ ] Generate strategic insights

---

## MCP Tool Design

### Tool: `fogsift_youtube_keyword_analyze`

**Parameters**:
- `keyword`: Search term
- `limit`: Number of videos to analyze (default: 10, max: 50)
- `sort_by`: Sort order (relevance, viewCount, date)

**Output**:
- Aggregated analysis report
- Individual video analyses
- Strategic recommendations

---

**Last Updated**: 2026-01-26
