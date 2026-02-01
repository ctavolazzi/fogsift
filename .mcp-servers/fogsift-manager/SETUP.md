# YouTube Analyzer Setup

## Quick Setup

### Option 1: yt-dlp (Recommended - Best Data)

```bash
# Install yt-dlp
pip install yt-dlp

# Or with Homebrew (macOS)
brew install yt-dlp
```

**Why**: Gets complete data including views, likes, description, etc.

### Option 2: Basic HTML Scraping (Works, Limited Data)

No installation needed - uses `curl` to fetch page HTML.

**Limitations**: May not get all metrics (views, likes may be missing)

---

## Testing

### Test the Tool

1. Restart Cursor/MCP server to load new tool
2. Use the tool:
   ```
   fogsift_youtube_analyze(url: "https://www.youtube.com/watch?v=VIDEO_ID")
   ```

### Example URLs to Test

- Any public YouTube video URL
- Tech teardown videos
- Successful creator videos

---

## How It Works

1. **Extracts Video Data**:
   - Uses yt-dlp if available (best)
   - Falls back to HTML scraping if not

2. **Parses Description** (90% focus):
   - Structure analysis
   - Keyword extraction
   - Link categorization
   - CTA detection
   - Timestamp extraction
   - Contact info
   - Monetization analysis

3. **Generates Insights**:
   - SEO scores
   - Strategic recommendations
   - Strengths/weaknesses

4. **Saves Results**:
   - Console output (formatted)
   - JSON file (structured data)

---

## Output Location

Analysis files saved to:
```
content/tech-teardowns/analyses/youtube-analysis-VIDEO_ID-TIMESTAMP.json
```

---

## Troubleshooting

### "Could not extract video description"
- Install yt-dlp: `pip install yt-dlp`
- Or video may be private/unavailable

### "yt-dlp not available"
- Install yt-dlp (see above)
- Tool will still work with HTML scraping (limited data)

### No views/likes shown
- Install yt-dlp for complete data
- HTML scraping doesn't always get these metrics

---

**Last Updated**: 2026-01-26
