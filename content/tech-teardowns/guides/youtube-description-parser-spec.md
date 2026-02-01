# YouTube Description Parser - Detailed Specification

**Purpose**: Detailed specification for parsing YouTube video descriptions to extract strategic business intelligence.

---

## Parser Components

### 1. Structure Parser

#### Input
- Raw description text

#### Output
```json
{
  "total_length": 1234,
  "word_count": 200,
  "character_count": 1234,
  "sections": [
    {
      "index": 0,
      "type": "introduction",
      "content": "Text...",
      "length": 150,
      "line_count": 3,
      "has_links": true,
      "has_formatting": false
    }
  ],
  "above_the_fold": {
    "text": "First 2-3 sentences...",
    "length": 200,
    "word_count": 30,
    "is_optimized": true
  },
  "formatting": {
    "bold_sections": ["Bold text"],
    "italic_sections": [],
    "code_sections": [],
    "line_breaks": 10,
    "lists": [
      {
        "type": "bulleted",
        "items": 5,
        "content": ["Item 1", "Item 2"]
      }
    ]
  }
}
```

#### Logic
1. Split by double line breaks (paragraphs)
2. Identify sections by:
   - Formatting changes
   - Link clusters
   - Content type (intro, links, social, etc.)
3. Extract first 2-3 sentences (above-the-fold)
4. Detect formatting (bold, italic, code)
5. Detect lists (bulleted, numbered)

---

### 2. Link Parser

#### Input
- Description text

#### Output
```json
{
  "total_links": 8,
  "links": [
    {
      "url": "https://twitter.com/username",
      "text": "Follow me on Twitter",
      "position": 150,
      "category": "social_media",
      "platform": "Twitter",
      "is_affiliate": false,
      "context": "Social media links section"
    }
  ],
  "categories": {
    "social_media": {
      "count": 3,
      "platforms": ["Twitter", "Instagram", "Discord"],
      "links": [...]
    },
    "website": {
      "count": 1,
      "links": [...]
    },
    "affiliate": {
      "count": 2,
      "links": [...]
    },
    "youtube": {
      "count": 1,
      "links": [...]
    },
    "support": {
      "count": 1,
      "platforms": ["Patreon"],
      "links": [...]
    }
  },
  "link_placement": {
    "first_100_chars": 0,
    "first_500_chars": 2,
    "middle_section": 3,
    "last_500_chars": 3
  },
  "link_density": 0.06
}
```

#### Link Categories

**Social Media**:
- Patterns: `twitter.com`, `instagram.com`, `facebook.com`, `tiktok.com`, `discord.gg`, `reddit.com`, etc.
- Handle extraction: `@username`, `/username`

**Affiliate Links**:
- Patterns: `amzn.to`, `amazon.com/.../ref=`, `bit.ly`, `tinyurl.com`, `go.`, etc.
- Detection: Shortened URLs, referral parameters

**YouTube Links**:
- Patterns: `youtube.com/watch`, `youtu.be`, `youtube.com/playlist`
- Types: Video, playlist, channel

**Support/Monetization**:
- Patterns: `patreon.com`, `ko-fi.com`, `buymeacoffee.com`, `paypal.me`
- Types: Patreon, Ko-fi, Buy Me a Coffee, PayPal

**Website/Blog**:
- Patterns: Generic URLs not matching above
- Main website detection

**Email**:
- Pattern: `mailto:` or email regex

#### Link Detection Logic
1. Find all URLs (regex: `https?://[^\s]+`)
2. Categorize by domain/pattern
3. Extract link text (text before/after URL)
4. Calculate position in description
5. Detect if affiliate (shortened URL, referral params)

---

### 3. Keyword Parser

#### Input
- Description text
- Video title (for comparison)

#### Output
```json
{
  "primary_keywords": {
    "first_sentence": ["keyword1", "keyword2"],
    "first_paragraph": ["keyword1", "keyword2", "keyword3"],
    "title_overlap": ["keyword1"]
  },
  "keyword_density": {
    "keyword1": {
      "count": 5,
      "density": 0.05,
      "positions": [10, 150, 300, 450, 600]
    }
  },
  "seo_analysis": {
    "first_sentence_optimization": 9,
    "keyword_placement_score": 8,
    "title_description_match": 7,
    "overall_seo_score": 8
  },
  "keyword_phrases": [
    {
      "phrase": "tech teardown",
      "count": 3,
      "importance": "high"
    }
  ]
```

#### Keyword Extraction Logic
1. Extract first 2-3 sentences (SEO focus area)
2. Identify keywords (common terms, phrases)
3. Compare with video title (overlap analysis)
4. Calculate keyword density
5. Score SEO optimization

#### SEO Scoring
- **First Sentence Optimization**: Keywords in first sentence? (0-10)
- **Keyword Placement**: Strategic placement? (0-10)
- **Title Match**: Keywords match title? (0-10)
- **Keyword Density**: Appropriate density? (0-10)
- **Overall**: Average of above

---

### 4. CTA Parser

#### Input
- Description text

#### Output
```json
{
  "total_ctas": 5,
  "ctas": [
    {
      "text": "Subscribe for more tech teardowns",
      "type": "subscribe",
      "position": 50,
      "effectiveness": 8,
      "has_emoji": true,
      "context": "First paragraph"
    },
    {
      "text": "Visit my website for more",
      "type": "website",
      "position": 200,
      "effectiveness": 7,
      "has_link": true,
      "context": "Links section"
    }
  ],
  "cta_distribution": {
    "subscribe": 1,
    "like_comment": 1,
    "website": 1,
    "social": 1,
    "support": 1
  },
  "cta_placement": {
    "first_100_chars": 1,
    "first_500_chars": 2,
    "middle": 1,
    "end": 2
  },
  "cta_effectiveness_score": 7.5
}
```

#### CTA Types

**Subscribe**:
- Patterns: "Subscribe", "Sub", "Hit subscribe", "Subscribe for more"
- Effectiveness: High if early, has emoji, clear

**Like/Comment**:
- Patterns: "Like", "Comment", "Thumbs up", "Let me know"
- Effectiveness: Medium

**Website**:
- Patterns: "Visit", "Check out", "Go to", "Website"
- Effectiveness: High if has link, clear value prop

**Social**:
- Patterns: "Follow", "Connect", "Join", "Find me on"
- Effectiveness: Medium-High

**Support**:
- Patterns: "Support", "Patreon", "Donate", "Buy me a coffee"
- Effectiveness: High if not pushy

**Watch More**:
- Patterns: "Watch", "See more", "Next video", "Playlist"
- Effectiveness: Medium

#### CTA Detection Logic
1. Pattern matching for CTA phrases
2. Extract CTA text and context
3. Categorize by type
4. Score effectiveness:
   - Placement (early = better)
   - Clarity
   - Has emoji/formatting
   - Has accompanying link
   - Not too pushy

---

### 5. Timestamp Parser

#### Input
- Description text

#### Output
```json
{
  "total_timestamps": 5,
  "has_chapters": true,
  "timestamps": [
    {
      "time": "0:00",
      "seconds": 0,
      "title": "Introduction",
      "position": 100,
      "has_keywords": true
    },
    {
      "time": "2:30",
      "seconds": 150,
      "title": "The Teardown Begins",
      "position": 120,
      "has_keywords": true
    }
  ],
  "chapter_analysis": {
    "average_chapter_length": "2:30",
    "total_video_coverage": "12:30",
    "keyword_usage": 4,
    "seo_value": "high"
  }
}
```

#### Timestamp Detection
- Patterns: `0:00`, `1:23`, `12:34`, `1:23:45`
- Extract time and title
- Calculate chapter length
- Analyze keyword usage in titles
- Assess SEO value

---

### 6. Contact Parser

#### Input
- Description text

#### Output
```json
{
  "emails": [
    {
      "email": "contact@example.com",
      "position": 500,
      "context": "Contact section"
    }
  ],
  "social_handles": {
    "twitter": "@username",
    "instagram": "@username",
    "discord": "username#1234"
  },
  "website": {
    "url": "https://example.com",
    "is_main": true
  },
  "contact_section": {
    "exists": true,
    "position": 400,
    "formatting": "organized"
  }
}
```

#### Contact Detection
- Email: Regex pattern
- Social handles: `@username`, `/username`
- Website: Main domain (not YouTube/social)

---

### 7. Monetization Parser

#### Input
- Description text
- Links (from link parser)

#### Output
```json
{
  "affiliate_links": {
    "count": 2,
    "links": [
      {
        "url": "https://amzn.to/...",
        "product": "Amazon product",
        "position": 300
      }
    ],
    "strategy": "moderate"
  },
  "sponsor_mentions": {
    "count": 1,
    "mentions": [
      {
        "text": "Sponsored by...",
        "position": 250
      }
    ]
  },
  "product_links": {
    "count": 1,
    "links": [...]
  },
  "support_links": {
    "count": 1,
    "platforms": ["Patreon"],
    "links": [...]
  },
  "monetization_strategy": "affiliate + support",
  "revenue_streams": ["affiliate", "sponsors", "support"]
}
```

#### Monetization Detection
- **Affiliate**: Shortened URLs, referral parameters
- **Sponsors**: "Sponsored by", "Thanks to", sponsor mentions
- **Products**: Product links, shop links
- **Support**: Patreon, Ko-fi, etc.

---

## Strategic Insights Generator

### Input
- All parsed data

### Output
```json
{
  "description_quality": "high",
  "seo_optimization": "excellent",
  "link_strategy": "aggressive",
  "cta_effectiveness": "good",
  "monetization_strategy": "affiliate + support",
  "strengths": [
    "Strong keyword placement in first sentence",
    "Good use of timestamps for SEO",
    "Multiple monetization channels",
    "Clear CTAs with good placement"
  ],
  "weaknesses": [
    "Too many links in first 500 chars",
    "Could use more keywords in middle section"
  ],
  "recommendations": [
    "Move some links to end of description",
    "Add more keywords in body paragraphs",
    "Consider adding more timestamps"
  ],
  "competitive_analysis": {
    "link_count_vs_average": "above",
    "cta_count_vs_average": "average",
    "seo_score_vs_average": "above"
  }
}
```

---

## Implementation Priority

### Phase 1: Core Parsing (MVP)
1. ✅ Basic structure analysis
2. ✅ Link extraction and categorization
3. ✅ Keyword extraction (first sentence)
4. ✅ Basic CTA detection

### Phase 2: Advanced Parsing
1. ✅ Full keyword analysis
2. ✅ Timestamp extraction
3. ✅ Contact extraction
4. ✅ Monetization analysis

### Phase 3: Strategic Insights
1. ✅ SEO scoring
2. ✅ CTA effectiveness
3. ✅ Recommendations
4. ✅ Competitive analysis

---

**Last Updated**: 2026-01-26
