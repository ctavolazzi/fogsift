# YouTube Video Analyzer - MCP Tool

**Tool**: `fogsift_youtube_analyze`
**Purpose**: Analyze YouTube videos and extract strategic business intelligence with heavy focus on description parsing (90% of analysis).

---

## Usage

### Basic Usage
```
fogsift_youtube_analyze(url: "https://www.youtube.com/watch?v=VIDEO_ID")
```

### What It Does

1. **Extracts Basic Metrics**:
   - Channel name
   - Video title
   - View count
   - Like count
   - Comment count
   - Upload date
   - Duration

2. **Parses Description (90% Focus)**:
   - **Structure**: Length, sections, above-the-fold content
   - **Keywords**: Primary keywords, SEO score, keyword placement
   - **Links**: All links categorized (social, affiliate, website, support, YouTube)
   - **CTAs**: All calls to action identified and scored
   - **Timestamps**: Chapters/timestamps for SEO
   - **Contact**: Email, social handles, website
   - **Monetization**: Affiliate links, sponsors, support platforms

3. **Generates Strategic Insights**:
   - Description quality assessment
   - SEO optimization score
   - Link strategy analysis
   - CTA effectiveness
   - Monetization strategy
   - Strengths, weaknesses, recommendations

---

## Requirements

### Option 1: yt-dlp (Recommended)
```bash
# Install yt-dlp
pip install yt-dlp
# or
brew install yt-dlp
```

**Pros**:
- ✅ No API key needed
- ✅ Gets all data (views, likes, description)
- ✅ Free and open source

### Option 2: YouTube Data API v3
- Requires API key from Google Cloud Console
- Free quota: 10,000 units/day
- Some data limitations (dislikes, saves)

---

## Output

### Console Output
Formatted text output showing:
- Basic metrics
- Description analysis breakdown
- Strategic insights
- Recommendations

### JSON File
Full structured data saved to:
```
content/tech-teardowns/analyses/youtube-analysis-VIDEO_ID-TIMESTAMP.json
```

---

## Example

### Input
```
fogsift_youtube_analyze(url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
```

### Output
```
📊 YouTube Video Analysis
════════════════════════════════════════════════════════════

📹 BASIC METRICS
────────────────────────────────────────────────────────────
Channel: Channel Name
Title: Video Title
Views: 1,234,567
Likes: 12,345
Comments: 1,234
...

📝 DESCRIPTION ANALYSIS (KEY FOCUS)
────────────────────────────────────────────────────────────

📐 STRUCTURE
  Length: 1234 chars, 200 words
  Sections: 5
  Above-the-fold (first 2-3 sentences):
    "First sentence with keywords..."
    SEO Optimized: ✅ Yes

🔑 KEYWORDS & SEO
  Primary Keywords: keyword1, keyword2, keyword3
  SEO Score: 8.5/10
  ...

🔗 LINKS (8 total)
  social_media: 3
  affiliate: 2
  website: 1
  ...

💰 MONETIZATION STRATEGY
  Strategy: affiliate + support
  Revenue Streams: affiliate, support
  ...

💡 STRATEGIC INSIGHTS
────────────────────────────────────────────────────────────
✅ STRENGTHS:
  • Strong SEO optimization
  • Good use of timestamps
  ...

💡 RECOMMENDATIONS:
  • Move some links to end
  • Add more keywords
  ...
```

---

## Data Structure

The JSON output includes:

```json
{
  "video_id": "VIDEO_ID",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "basic_metrics": { ... },
  "description_analysis": {
    "raw_description": "...",
    "structure": { ... },
    "keywords": { ... },
    "links": { ... },
    "ctas": { ... },
    "timestamps": { ... },
    "contact": { ... },
    "monetization": { ... }
  },
  "strategic_insights": { ... }
}
```

---

## Use Cases

1. **Competitor Analysis**: Analyze successful videos to understand what works
2. **SEO Research**: See how top videos optimize descriptions
3. **Monetization Strategy**: Learn how others monetize
4. **CTA Analysis**: See what CTAs work best
5. **Link Strategy**: Understand link placement strategies

---

## Tips

1. **Focus on Description**: 90% of the value is in description parsing
2. **Compare Multiple Videos**: Analyze several videos to see patterns
3. **Save Analyses**: JSON files are saved for later reference
4. **Use Insights**: Apply recommendations to your own videos

---

**Last Updated**: 2026-01-26
