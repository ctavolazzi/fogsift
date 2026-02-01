# YouTube Video Analyzer - Design Document

**Purpose**: System to analyze YouTube videos and extract strategic business intelligence, with heavy focus on description parsing.

---

## Core Functionality

### Input
- **YouTube URL** (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)

### Output
- **Structured Data Dashboard** showing:
  - Basic video metrics
  - **Detailed description analysis** (90% focus)
  - Strategic insights for business decisions

---

## Data to Extract

### Basic Video Metrics
- Channel Name
- Video Title
- View Count
- Like Count
- Dislike Count (if available via API)
- Save Count (if available)
- Comment Count
- Upload Date
- Video Duration
- Thumbnail URL

### Description Content (KEY FOCUS - 90%)

#### 1. Structure Analysis
- **Length**: Total characters, word count
- **Sections**: Identify distinct sections/paragraphs
- **Formatting**: Bold text, links, line breaks, lists
- **Above-the-fold**: First 2-3 sentences (most important for SEO)

#### 2. Keywords Analysis
- **Primary Keywords**: Most important keywords (first 2-3 sentences)
- **Keyword Density**: Frequency of key terms
- **Keyword Placement**: Where keywords appear
- **SEO Score**: How well optimized for search

#### 3. Links Analysis
- **All Links**: Extract all URLs
- **Link Categories**:
  - Social Media (Twitter, Instagram, etc.)
  - Website/Blog
  - Affiliate Links
  - Product Links
  - Other Videos/Playlists
  - Patreon/Ko-fi/Support
  - Email/Contact
- **Link Placement**: Where links appear in description
- **Link Count**: Total number of links

#### 4. CTAs (Calls to Action)
- **CTAs Found**: All calls to action
- **CTA Types**:
  - Subscribe
  - Like/Comment
  - Visit Website
  - Follow Social
  - Buy/Support
  - Watch More
  - Other
- **CTA Placement**: Where CTAs appear
- **CTA Effectiveness**: Analysis of CTA language

#### 5. Timestamps/Chapters
- **Timestamps Found**: All timestamps
- **Chapter Structure**: How chapters are organized
- **Chapter Keywords**: Keywords in chapter titles

#### 6. Contact Information
- **Email Addresses**: If present
- **Social Handles**: Twitter, Instagram, etc.
- **Website**: Main website URL

#### 7. Affiliate/Monetization
- **Affiliate Links**: Amazon, etc.
- **Sponsor Mentions**: Sponsored content
- **Product Links**: Products being sold/promoted
- **Support Links**: Patreon, Ko-fi, etc.

#### 8. Content Structure
- **Introduction**: First paragraph
- **Main Content**: Body paragraphs
- **Links Section**: Where links are grouped
- **Social Section**: Social media links
- **Footer**: Closing/legal text

---

## Description Parser Specification

### Parsing Strategy

#### Phase 1: Basic Extraction
1. Extract raw description text
2. Clean and normalize (remove extra whitespace)
3. Split into sections (by line breaks, formatting)

#### Phase 2: Structure Analysis
1. Identify sections (by formatting, spacing)
2. Extract first 2-3 sentences (above-the-fold)
3. Identify lists, bullet points
4. Identify timestamps/chapters

#### Phase 3: Link Extraction
1. Extract all URLs (regex pattern)
2. Categorize links:
   - Social media patterns (twitter.com, instagram.com, etc.)
   - Affiliate patterns (amzn.to, etc.)
   - YouTube patterns (youtube.com, youtu.be)
   - Email patterns
   - Generic URLs
3. Extract link text/context

#### Phase 4: Keyword Analysis
1. Extract first 2-3 sentences (SEO focus)
2. Identify keywords (common terms, phrases)
3. Calculate keyword density
4. Identify keyword placement

#### Phase 5: CTA Detection
1. Search for CTA patterns:
   - "Subscribe"
   - "Like and comment"
   - "Visit"
   - "Follow"
   - "Buy"
   - "Support"
   - "Check out"
   - "Watch"
2. Extract CTA context
3. Categorize CTA types

#### Phase 6: Contact Extraction
1. Extract email addresses (regex)
2. Extract social handles (@username, /username)
3. Extract website URLs

---

## Data Structure

### Output JSON Structure

```json
{
  "video_id": "VIDEO_ID",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "basic_metrics": {
    "channel_name": "Channel Name",
    "video_title": "Video Title",
    "view_count": 123456,
    "like_count": 1234,
    "dislike_count": null,
    "save_count": null,
    "comment_count": 567,
    "upload_date": "2024-01-15",
    "duration": "10:30",
    "thumbnail_url": "https://..."
  },
  "description_analysis": {
    "raw_description": "Full description text...",
    "structure": {
      "total_length": 1234,
      "word_count": 200,
      "sections": [
        {
          "section_number": 1,
          "content": "Section text...",
          "type": "introduction",
          "length": 150
        }
      ],
      "above_the_fold": "First 2-3 sentences...",
      "formatting": {
        "bold_text": ["Bold text 1", "Bold text 2"],
        "links_count": 5,
        "line_breaks": 10,
        "lists": 2
      }
    },
    "keywords": {
      "primary_keywords": ["keyword1", "keyword2"],
      "keyword_density": {
        "keyword1": 0.05,
        "keyword2": 0.03
      },
      "keyword_placement": {
        "first_sentence": ["keyword1"],
        "title_match": ["keyword2"]
      },
      "seo_score": 8.5
    },
    "links": {
      "total_links": 5,
      "categories": {
        "social_media": [
          {
            "url": "https://twitter.com/username",
            "platform": "Twitter",
            "text": "Follow me on Twitter",
            "position": 150
          }
        ],
        "website": [
          {
            "url": "https://example.com",
            "text": "Visit my website",
            "position": 200
          }
        ],
        "affiliate": [
          {
            "url": "https://amzn.to/...",
            "text": "Buy on Amazon",
            "position": 300
          }
        ],
        "youtube": [
          {
            "url": "https://youtube.com/...",
            "text": "Watch more",
            "position": 400
          }
        ],
        "support": [
          {
            "url": "https://patreon.com/...",
            "text": "Support on Patreon",
            "position": 500
          }
        ]
      },
      "link_placement_analysis": {
        "first_100_chars": 0,
        "first_500_chars": 2,
        "middle": 1,
        "end": 2
      }
    },
    "ctas": {
      "total_ctas": 4,
      "ctas": [
        {
          "text": "Subscribe for more",
          "type": "subscribe",
          "position": 50,
          "effectiveness_score": 8
        },
        {
          "text": "Visit my website",
          "type": "website",
          "position": 200,
          "effectiveness_score": 7
        }
      ],
      "cta_distribution": {
        "subscribe": 1,
        "website": 1,
        "social": 1,
        "support": 1
      }
    },
    "timestamps": {
      "total_timestamps": 5,
      "timestamps": [
        {
          "time": "0:00",
          "title": "Introduction",
          "position": 100
        }
      ],
      "has_chapters": true
    },
    "contact_info": {
      "emails": ["email@example.com"],
      "social_handles": {
        "twitter": "@username",
        "instagram": "@username"
      },
      "website": "https://example.com"
    },
    "monetization": {
      "affiliate_links": 2,
      "sponsor_mentions": 1,
      "product_links": 1,
      "support_links": 1
    }
  },
  "strategic_insights": {
    "description_quality": "high",
    "seo_optimization": "excellent",
    "link_strategy": "aggressive",
    "cta_effectiveness": "good",
    "monetization_strategy": "affiliate + support",
    "recommendations": [
      "Strong keyword placement in first sentence",
      "Good use of timestamps for SEO",
      "Multiple monetization channels"
    ]
  }
}
```

---

## Implementation Approach

### Option 1: YouTube Data API v3 (Official)

**Pros**:
- ✅ Official, reliable
- ✅ No scraping issues
- ✅ Good documentation
- ✅ Free quota (10,000 units/day)

**Cons**:
- ❌ Requires API key
- ❌ Some data limited (dislikes, saves)
- ❌ Quota limits

**Setup**:
1. Get API key from Google Cloud Console
2. Use `videos.list` endpoint
3. Parse response

### Option 2: Python Library (youtube-dl / yt-dlp)

**Pros**:
- ✅ No API key needed
- ✅ More data available
- ✅ Can get transcripts

**Cons**:
- ❌ May break with YouTube changes
- ❌ Legal gray area
- ❌ Rate limiting issues

### Option 3: Hybrid Approach (Recommended)

**Use YouTube Data API for**:
- Basic metrics (views, likes, etc.)
- Channel info
- Video metadata

**Use Custom Parser for**:
- Description analysis
- Link extraction
- CTA detection
- Keyword analysis

---

## Description Parser Implementation

### Python Parser Functions

```python
def parse_description(description_text):
    """Main parser function"""
    return {
        "structure": analyze_structure(description_text),
        "keywords": extract_keywords(description_text),
        "links": extract_links(description_text),
        "ctas": extract_ctas(description_text),
        "timestamps": extract_timestamps(description_text),
        "contact": extract_contact(description_text),
        "monetization": analyze_monetization(description_text)
    }

def analyze_structure(text):
    """Analyze description structure"""
    # Split into sections
    # Identify formatting
    # Extract above-the-fold
    pass

def extract_keywords(text):
    """Extract and analyze keywords"""
    # First 2-3 sentences
    # Keyword density
    # Placement analysis
    pass

def extract_links(text):
    """Extract and categorize all links"""
    # Find all URLs
    # Categorize by type
    # Extract context
    pass

def extract_ctas(text):
    """Extract calls to action"""
    # Pattern matching
    # Categorize types
    # Extract context
    pass

def extract_timestamps(text):
    """Extract timestamps/chapters"""
    # Pattern matching (0:00, 1:23, etc.)
    # Extract chapter titles
    pass

def extract_contact(text):
    """Extract contact information"""
    # Email addresses
    # Social handles
    # Website
    pass

def analyze_monetization(text):
    """Analyze monetization strategy"""
    # Affiliate links
    # Sponsor mentions
    # Product links
    # Support links
    pass
```

---

## Display/Dashboard Design

### Key Metrics Dashboard
- **Top Section**: Basic video metrics (views, likes, etc.)
- **Main Section**: Description analysis (90% of space)
  - Structure breakdown
  - Keywords highlighted
  - Links categorized and displayed
  - CTAs identified
  - Strategic insights

### Strategic Insights Panel
- **SEO Score**: How well optimized
- **Link Strategy**: Aggressive/Moderate/Conservative
- **Monetization Strategy**: What they're doing
- **CTA Effectiveness**: How many, how placed
- **Recommendations**: What to learn/apply

---

## Next Steps

1. **Choose Implementation**: API vs. Library vs. Hybrid
2. **Build Parser**: Description parsing functions
3. **Create Dashboard**: Display interface
4. **Test**: Test with real YouTube URLs
5. **Iterate**: Refine based on needs

---

**Last Updated**: 2026-01-26
