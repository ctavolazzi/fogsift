#!/usr/bin/env node
/**
 * FogSift Manager MCP Server
 *
 * Provides tools for managing the FogSift website:
 * - Build and deploy
 * - Queue management
 * - Content updates
 * - Dev server control
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync, spawn } from 'child_process';
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
import {
  analyzeTitle,
  analyzeChannel,
  compareChannels,
  generateStrategicRecommendations,
  extractChannelId
} from './youtube-god-modules.js';
import {
  searchYouTube,
  aggregateAnalyses,
  extractBestPractices,
  identifyOpportunities
} from './youtube-keyword-analyzer.js';

// FogSift project root
const FOGSIFT_ROOT = path.resolve(process.env.FOGSIFT_ROOT || '/Users/ctavolazzi/Code/fogsift');
const QUEUE_PATH = path.join(FOGSIFT_ROOT, 'src/content/queue.json');

// Track dev server process
let devServerProcess = null;

// Helper to run commands
function runCommand(cmd, cwd = FOGSIFT_ROOT) {
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      timeout: 120000 // 2 minute timeout
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || ''
    };
  }
}

// Load queue data
function loadQueue() {
  try {
    const data = fs.readFileSync(QUEUE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Save queue data
function saveQueue(data) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(data, null, 2));
}

// Generate queue item ID
function generateQueueId() {
  return `PST-${Date.now().toString(36).toUpperCase()}`;
}

// Create server
const server = new Server(
  {
    name: 'fogsift-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Build & Deploy
      {
        name: 'fogsift_build',
        description: 'Build the FogSift website. Compiles CSS, JS, processes HTML templates, and generates wiki pages.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'fogsift_deploy',
        description: 'Deploy the FogSift website to Cloudflare Pages.',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Optional deployment message'
            }
          },
          required: []
        }
      },

      // Dev Server
      {
        name: 'fogsift_dev_start',
        description: 'Start the local development server on port 5050.',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port number (default: 5050)'
            }
          },
          required: []
        }
      },
      {
        name: 'fogsift_dev_stop',
        description: 'Stop the local development server.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },

      // Queue Management
      {
        name: 'fogsift_queue_list',
        description: 'List all items in the queue (pending and completed).',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['all', 'pending', 'completed'],
              description: 'Filter by status (default: all)'
            }
          },
          required: []
        }
      },
      {
        name: 'fogsift_queue_add',
        description: 'Add a new problem to the queue.',
        inputSchema: {
          type: 'object',
          properties: {
            problem_summary: {
              type: 'string',
              description: 'Brief description of the problem'
            },
            display_name: {
              type: 'string',
              description: 'Name to display (use "Anonymous" for anonymous submissions)'
            },
            category: {
              type: 'string',
              description: 'Category (e.g., Technical, Operations, Marketing/Growth, Business Strategy, Product/UX)'
            },
            anonymized: {
              type: 'boolean',
              description: 'Whether to anonymize the submission (default: false)'
            }
          },
          required: ['problem_summary', 'display_name', 'category']
        }
      },
      {
        name: 'fogsift_queue_complete',
        description: 'Mark a queue item as completed with an outcome.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The queue item ID (e.g., PST-001)'
            },
            outcome: {
              type: 'string',
              enum: ['go_deeper', 'i_know_people', 'this_is_sick'],
              description: 'The outcome type'
            },
            outcome_text: {
              type: 'string',
              description: 'Description of what was found/delivered'
            }
          },
          required: ['id', 'outcome', 'outcome_text']
        }
      },
      {
        name: 'fogsift_queue_remove',
        description: 'Remove an item from the queue (refund scenario).',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The queue item ID to remove'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'fogsift_queue_bump',
        description: 'Bump a queue item up in position.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The queue item ID to bump'
            },
            positions: {
              type: 'number',
              description: 'Number of positions to move up (default: 1)'
            }
          },
          required: ['id']
        }
      },

      // Content Management
      {
        name: 'fogsift_content_update',
        description: 'Update content files (articles.json, testimonials.json, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              enum: ['articles', 'testimonials', 'status'],
              description: 'Which content file to update'
            },
            action: {
              type: 'string',
              enum: ['add', 'update', 'remove'],
              description: 'Action to perform'
            },
            data: {
              type: 'object',
              description: 'The data to add/update'
            }
          },
          required: ['file', 'action', 'data']
        }
      },

      // Status & Info
      {
        name: 'fogsift_status',
        description: 'Get the current status of the FogSift project (git status, queue stats, etc.)',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },

      // Clear mock data flag
      {
        name: 'fogsift_queue_go_live',
        description: 'Remove the mock data flag from queue.json (go live with real data).',
        inputSchema: {
          type: 'object',
          properties: {
            clear_mock_items: {
              type: 'boolean',
              description: 'Also clear the mock queue items (default: true)'
            }
          },
          required: []
        }
      },

      // YouTube Video Analysis
      {
        name: 'fogsift_youtube_analyze',
        description: 'Analyze a YouTube video URL and extract strategic business intelligence, with heavy focus on description parsing (90% of analysis).',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'fogsift_youtube_channel_analyze',
        description: 'Analyze a YouTube channel and extract comprehensive channel intelligence including content strategy, growth patterns, monetization, and SEO patterns.',
        inputSchema: {
          type: 'object',
          properties: {
            channel_url: {
              type: 'string',
              description: 'YouTube channel URL or channel name/handle'
            },
            video_limit: {
              type: 'number',
              description: 'Number of recent videos to analyze (default: 10, max: 50)'
            }
          },
          required: ['channel_url']
        }
      },
      {
        name: 'fogsift_youtube_competitor_compare',
        description: 'Compare multiple YouTube channels side-by-side to identify gaps, opportunities, and competitive advantages.',
        inputSchema: {
          type: 'object',
          properties: {
            channel_urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of YouTube channel URLs to compare (2-5 channels)'
            }
          },
          required: ['channel_urls']
        }
      },
      {
        name: 'fogsift_youtube_strategy_recommend',
        description: 'Generate strategic recommendations based on video/channel analysis for content strategy, SEO optimization, monetization, and growth.',
        inputSchema: {
          type: 'object',
          properties: {
            analysis_data: {
              type: 'object',
              description: 'Analysis data from youtube_analyze or youtube_channel_analyze'
            }
          },
          required: ['analysis_data']
        }
      },
      {
        name: 'fogsift_youtube_keyword_analyze',
        description: 'Search YouTube for videos by keyword and analyze top results to understand what works in that niche. Analyzes multiple videos and aggregates insights.',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword/term (e.g., "tech teardown", "vintage computer")'
            },
            limit: {
              type: 'number',
              description: 'Number of videos to analyze (default: 10, max: 50)'
            }
          },
          required: ['keyword']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    // ==================== BUILD & DEPLOY ====================
    case 'fogsift_build': {
      const result = runCommand('npm run build');
      return {
        content: [{
          type: 'text',
          text: result.success
            ? `✅ Build successful!\n\n${result.output}`
            : `❌ Build failed!\n\nError: ${result.error}\n\nOutput: ${result.output}\n\nStderr: ${result.stderr}`
        }]
      };
    }

    case 'fogsift_deploy': {
      const message = args?.message || 'Deploy from MCP';
      // First build
      const buildResult = runCommand('npm run build');
      if (!buildResult.success) {
        return {
          content: [{
            type: 'text',
            text: `❌ Build failed, cannot deploy!\n\n${buildResult.error}`
          }]
        };
      }
      // Then deploy
      const deployResult = runCommand(`npm run deploy`);
      return {
        content: [{
          type: 'text',
          text: deployResult.success
            ? `✅ Deployed successfully!\n\n${deployResult.output}`
            : `❌ Deploy failed!\n\n${deployResult.error}\n\n${deployResult.stderr}`
        }]
      };
    }

    // ==================== DEV SERVER ====================
    case 'fogsift_dev_start': {
      const port = args?.port || 5050;

      // Kill any existing server on that port
      try {
        execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { encoding: 'utf8' });
      } catch (e) { /* ignore */ }

      // Start new server in background
      devServerProcess = spawn('npx', ['serve', 'dist', '-p', port.toString()], {
        cwd: FOGSIFT_ROOT,
        detached: true,
        stdio: 'ignore'
      });
      devServerProcess.unref();

      return {
        content: [{
          type: 'text',
          text: `✅ Dev server started at http://localhost:${port}\n\nServing: ${path.join(FOGSIFT_ROOT, 'dist')}`
        }]
      };
    }

    case 'fogsift_dev_stop': {
      try {
        execSync('pkill -f "serve dist" 2>/dev/null || true', { encoding: 'utf8' });
        return {
          content: [{
            type: 'text',
            text: '✅ Dev server stopped'
          }]
        };
      } catch (e) {
        return {
          content: [{
            type: 'text',
            text: '⚠️ No dev server was running'
          }]
        };
      }
    }

    // ==================== QUEUE MANAGEMENT ====================
    case 'fogsift_queue_list': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const status = args?.status || 'all';
      let output = `📋 FogSift Queue\n`;
      output += `${'─'.repeat(50)}\n`;
      output += `Stats: ${queue.stats.in_queue} in queue, ${queue.stats.completed} completed\n`;
      output += `Mock Data: ${queue.meta.is_mock_data ? 'Yes' : 'No'}\n`;
      output += `${'─'.repeat(50)}\n\n`;

      if (status === 'all' || status === 'pending') {
        output += `🕐 PENDING (${queue.queue.length})\n`;
        queue.queue.forEach((item, i) => {
          output += `  #${i + 1} [${item.id}] ${item.problem_summary.substring(0, 50)}...\n`;
          output += `      ${item.display_name} | ${item.category}\n`;
        });
        output += '\n';
      }

      if (status === 'all' || status === 'completed') {
        output += `✅ COMPLETED (${queue.completed.length})\n`;
        queue.completed.forEach(item => {
          output += `  [${item.id}] ${item.problem_summary.substring(0, 50)}...\n`;
          output += `      Outcome: ${item.outcome}\n`;
        });
      }

      return {
        content: [{
          type: 'text',
          text: output
        }]
      };
    }

    case 'fogsift_queue_add': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const newItem = {
        id: generateQueueId(),
        status: 'in_queue',
        submitted: new Date().toISOString(),
        display_name: args.display_name,
        problem_summary: args.problem_summary,
        category: args.category,
        anonymized: args.anonymized || false,
        position: queue.queue.length + 1
      };

      queue.queue.push(newItem);
      queue.stats.in_queue = queue.queue.length;
      queue.stats.total_submitted++;
      queue.meta.updated = new Date().toISOString();

      saveQueue(queue);

      return {
        content: [{
          type: 'text',
          text: `✅ Added to queue!\n\nID: ${newItem.id}\nPosition: #${newItem.position}\nProblem: ${newItem.problem_summary}`
        }]
      };
    }

    case 'fogsift_queue_complete': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const itemIndex = queue.queue.findIndex(item => item.id === args.id);
      if (itemIndex === -1) {
        return {
          content: [{
            type: 'text',
            text: `❌ Item ${args.id} not found in queue`
          }]
        };
      }

      const item = queue.queue.splice(itemIndex, 1)[0];
      item.status = 'completed';
      item.completed = new Date().toISOString();
      item.outcome = args.outcome;
      item.outcome_text = args.outcome_text;
      item.video_published = false;

      queue.completed.unshift(item);
      queue.stats.in_queue = queue.queue.length;
      queue.stats.completed = queue.completed.length;
      queue.meta.updated = new Date().toISOString();

      // Update positions
      queue.queue.forEach((item, i) => item.position = i + 1);

      saveQueue(queue);

      const outcomeLabels = {
        'go_deeper': '"Let\'s go deeper."',
        'i_know_people': '"I know people."',
        'this_is_sick': '"This is sick."'
      };

      return {
        content: [{
          type: 'text',
          text: `✅ Marked as completed!\n\nID: ${args.id}\nOutcome: ${outcomeLabels[args.outcome]}\nDetails: ${args.outcome_text}`
        }]
      };
    }

    case 'fogsift_queue_remove': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const itemIndex = queue.queue.findIndex(item => item.id === args.id);
      if (itemIndex === -1) {
        return {
          content: [{
            type: 'text',
            text: `❌ Item ${args.id} not found in queue`
          }]
        };
      }

      const removed = queue.queue.splice(itemIndex, 1)[0];
      queue.stats.in_queue = queue.queue.length;
      queue.queue.forEach((item, i) => item.position = i + 1);
      queue.meta.updated = new Date().toISOString();

      saveQueue(queue);

      return {
        content: [{
          type: 'text',
          text: `✅ Removed from queue!\n\nID: ${removed.id}\nProblem: ${removed.problem_summary}\n\n(Refund should be processed separately)`
        }]
      };
    }

    case 'fogsift_queue_bump': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const itemIndex = queue.queue.findIndex(item => item.id === args.id);
      if (itemIndex === -1) {
        return {
          content: [{
            type: 'text',
            text: `❌ Item ${args.id} not found in queue`
          }]
        };
      }

      const positions = args.positions || 1;
      const newIndex = Math.max(0, itemIndex - positions);

      if (newIndex === itemIndex) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ Item ${args.id} is already at position #1`
          }]
        };
      }

      const [item] = queue.queue.splice(itemIndex, 1);
      queue.queue.splice(newIndex, 0, item);
      queue.queue.forEach((item, i) => item.position = i + 1);
      queue.meta.updated = new Date().toISOString();

      saveQueue(queue);

      return {
        content: [{
          type: 'text',
          text: `✅ Bumped!\n\nID: ${args.id}\nOld position: #${itemIndex + 1}\nNew position: #${newIndex + 1}`
        }]
      };
    }

    case 'fogsift_queue_go_live': {
      const queue = loadQueue();
      if (!queue) {
        return {
          content: [{
            type: 'text',
            text: '❌ Could not load queue.json'
          }]
        };
      }

      const clearMock = args?.clear_mock_items !== false;

      queue.meta.is_mock_data = false;
      queue.meta.note = 'Live queue data';
      queue.meta.updated = new Date().toISOString();

      if (clearMock) {
        queue.queue = [];
        queue.completed = [];
        queue.stats = {
          total_submitted: 0,
          completed: 0,
          in_queue: 0,
          avg_days_to_pickup: 0
        };
      }

      saveQueue(queue);

      return {
        content: [{
          type: 'text',
          text: clearMock
            ? '✅ Queue is now LIVE!\n\nMock data cleared. Ready for real submissions.'
            : '✅ Queue is now LIVE!\n\nMock data flag removed. Existing items preserved.'
        }]
      };
    }

    // ==================== CONTENT MANAGEMENT ====================
    case 'fogsift_content_update': {
      const contentPath = path.join(FOGSIFT_ROOT, `src/content/${args.file}.json`);

      try {
        let content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

        switch (args.action) {
          case 'add':
            if (Array.isArray(content)) {
              content.push(args.data);
            } else if (content.items) {
              content.items.push(args.data);
            }
            break;
          case 'update':
            if (args.data.id) {
              const idx = (content.items || content).findIndex(i => i.id === args.data.id);
              if (idx !== -1) {
                (content.items || content)[idx] = { ...(content.items || content)[idx], ...args.data };
              }
            }
            break;
          case 'remove':
            if (args.data.id) {
              const arr = content.items || content;
              const idx = arr.findIndex(i => i.id === args.data.id);
              if (idx !== -1) arr.splice(idx, 1);
            }
            break;
        }

        fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));

        return {
          content: [{
            type: 'text',
            text: `✅ Updated ${args.file}.json`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Failed to update ${args.file}.json: ${error.message}`
          }]
        };
      }
    }

    // ==================== YOUTUBE ANALYSIS ====================
    case 'fogsift_youtube_analyze': {
      const url = args.url;
      const videoId = extractVideoId(url);

      if (!videoId) {
        return {
          content: [{
            type: 'text',
            text: '❌ Invalid YouTube URL. Please provide a valid YouTube video URL.'
          }],
          isError: true
        };
      }

      try {
        // Use yt-dlp to get video info (fallback to YouTube Data API if not available)
        let videoData = null;
        let description = '';
        let title = '';
        let channelName = '';
        let viewCount = 0;
        let likeCount = 0;
        let commentCount = 0;
        let uploadDate = '';
        let duration = '';

        // Try to use yt-dlp if available (Python tool, not npm package)
        try {
          const ytdlpResult = runCommand(`yt-dlp --dump-json --no-warnings "${url}" 2>/dev/null`, process.cwd());
          if (ytdlpResult.success && ytdlpResult.output) {
            try {
              videoData = JSON.parse(ytdlpResult.output);
              description = videoData.description || '';
              title = videoData.title || '';
              channelName = videoData.uploader || videoData.channel || '';
              viewCount = videoData.view_count || 0;
              likeCount = videoData.like_count || 0;
              commentCount = videoData.comment_count || 0;
              uploadDate = videoData.upload_date ?
                `${videoData.upload_date.substring(0,4)}-${videoData.upload_date.substring(4,6)}-${videoData.upload_date.substring(6,8)}` : '';
              duration = videoData.duration_string || '';
            } catch (parseError) {
              console.error('Failed to parse yt-dlp output:', parseError.message);
            }
          }
        } catch (e) {
          // yt-dlp not available, try fallback
          console.error('yt-dlp not available, trying fallback');
        }

        // Fallback: Try to fetch page HTML and extract basic info
        if (!description || !title) {
          try {
            const htmlResult = runCommand(`curl -sL "${url}"`, process.cwd());
            if (htmlResult.success && htmlResult.output) {
              const html = htmlResult.output;

              // Extract title
              const titleMatch = html.match(/<title>([^<]+)<\/title>/);
              if (titleMatch) {
                title = titleMatch[1].replace(' - YouTube', '').trim();
              }

              // Extract description (from meta tag or initialData)
              const descMatch = html.match(/"shortDescription":"([^"]+)"/);
              if (descMatch) {
                description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
              }

              // Extract channel name
              const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/);
              if (channelMatch) {
                channelName = channelMatch[1];
              }

              // Extract view count
              const viewMatch = html.match(/"viewCount":"(\d+)"/);
              if (viewMatch) {
                viewCount = parseInt(viewMatch[1]);
              }
            }
          } catch (e) {
            console.error('Fallback extraction failed:', e.message);
          }
        }

        // If still no description, return error with instructions
        if (!description) {
          return {
            content: [{
              type: 'text',
              text: `⚠️ Could not extract video description.\n\n` +
                    `To get full data, install yt-dlp:\n` +
                    `  pip install yt-dlp\n` +
                    `  or\n` +
                    `  brew install yt-dlp\n\n` +
                    `Alternatively, you can use YouTube Data API v3 with an API key.\n\n` +
                    `The analyzer will work with basic HTML scraping, but yt-dlp provides the most complete data.`
            }]
          };
        }

        const descriptionAnalysis = {
          structure: parseStructure(description),
          keywords: parseKeywords(description, title),
          links: parseLinks(description),
          ctas: parseCTAs(description),
          timestamps: parseTimestamps(description),
          contact: parseContact(description),
          monetization: parseMonetization(description, parseLinks(description).links)
        };

        // Title analysis (God of YouTube enhancement)
        const titleAnalysis = analyzeTitle(title, description);

        const insights = generateInsights(descriptionAnalysis, {
          viewCount,
          likeCount,
          commentCount
        });

        // Format output for display
        let output = `📊 YouTube Video Analysis\n`;
        output += `${'═'.repeat(60)}\n\n`;

        // Basic Metrics
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

        // Description Analysis (90% focus)
        output += `📝 DESCRIPTION ANALYSIS (KEY FOCUS)\n`;
        output += `${'─'.repeat(60)}\n\n`;

        // Structure
        output += `📐 STRUCTURE\n`;
        output += `  Length: ${descriptionAnalysis.structure.total_length} chars, ${descriptionAnalysis.structure.word_count} words\n`;
        output += `  Sections: ${descriptionAnalysis.structure.sections.length}\n`;
        output += `  Above-the-fold (first 2-3 sentences):\n`;
        output += `    "${descriptionAnalysis.structure.above_the_fold.text.substring(0, 150)}..."\n`;
        output += `    SEO Optimized: ${descriptionAnalysis.structure.above_the_fold.is_optimized ? '✅ Yes' : '❌ No'}\n\n`;

        // Title Analysis (God of YouTube)
        output += `📌 TITLE ANALYSIS\n`;
        output += `  Length: ${titleAnalysis.length} chars, ${titleAnalysis.word_count} words\n`;
        output += `  SEO Score: ${titleAnalysis.seo_score}/10\n`;
        output += `  Clickbait Score: ${titleAnalysis.clickbait_score}/10\n`;
        output += `  Format: ${titleAnalysis.structure.format}\n`;
        output += `  Has Numbers: ${titleAnalysis.has_numbers ? '✅' : '❌'}\n`;
        output += `  Has Emoji: ${titleAnalysis.has_emoji ? '✅' : '❌'}\n\n`;

        // Keywords
        output += `🔑 KEYWORDS & SEO\n`;
        output += `  Primary Keywords: ${descriptionAnalysis.keywords.primary_keywords.first_sentence.slice(0, 5).join(', ')}\n`;
        output += `  SEO Score: ${descriptionAnalysis.keywords.seo_analysis.overall_seo_score.toFixed(1)}/10\n`;
        output += `  First Sentence Optimization: ${descriptionAnalysis.keywords.seo_analysis.first_sentence_optimization}/10\n`;
        output += `  Title Match: ${descriptionAnalysis.keywords.seo_analysis.title_description_match}/10\n\n`;

        // Links
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

        // CTAs
        output += `📢 CALLS TO ACTION (${descriptionAnalysis.ctas.total_ctas} total)\n`;
        descriptionAnalysis.ctas.ctas.slice(0, 5).forEach(cta => {
          output += `  [${cta.type}] "${cta.text.substring(0, 50)}..." (Effectiveness: ${cta.effectiveness}/10)\n`;
        });
        output += `  Average Effectiveness: ${descriptionAnalysis.ctas.cta_effectiveness_score.toFixed(1)}/10\n\n`;

        // Timestamps
        if (descriptionAnalysis.timestamps.has_chapters) {
          output += `⏱️  TIMESTAMPS/CHAPTERS (${descriptionAnalysis.timestamps.total_timestamps} total)\n`;
          output += `  SEO Value: ${descriptionAnalysis.timestamps.chapter_analysis.seo_value}\n`;
          descriptionAnalysis.timestamps.timestamps.slice(0, 5).forEach(ts => {
            output += `    ${ts.time} - ${ts.title.substring(0, 40)}\n`;
          });
          output += `\n`;
        }

        // Monetization
        output += `💰 MONETIZATION STRATEGY\n`;
        output += `  Strategy: ${descriptionAnalysis.monetization.monetization_strategy}\n`;
        output += `  Revenue Streams: ${descriptionAnalysis.monetization.revenue_streams.join(', ') || 'None detected'}\n`;
        output += `  Affiliate Links: ${descriptionAnalysis.monetization.affiliate_links.count}\n`;
        output += `  Support Links: ${descriptionAnalysis.monetization.support_links.count} (${descriptionAnalysis.monetization.support_links.platforms.join(', ') || 'None'})\n`;
        output += `  Sponsor Mentions: ${descriptionAnalysis.monetization.sponsor_mentions.count}\n\n`;

        // Strategic Insights
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

        // Also return structured JSON for programmatic use
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
          title_analysis: titleAnalysis,
          strategic_insights: insights
        };

        // Save to file for reference
        const analysisPath = path.join(FOGSIFT_ROOT, 'content/tech-teardowns/analyses');
        if (!fs.existsSync(analysisPath)) {
          fs.mkdirSync(analysisPath, { recursive: true });
        }
        const filename = `youtube-analysis-${videoId}-${Date.now()}.json`;
        fs.writeFileSync(
          path.join(analysisPath, filename),
          JSON.stringify(structuredData, null, 2)
        );

        output += `\n${'═'.repeat(60)}\n`;
        output += `📁 Full analysis saved to: ${filename}\n`;

        return {
          content: [{
            type: 'text',
            text: output
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error analyzing video: ${error.message}\n\nStack: ${error.stack}`
          }],
          isError: true
        };
      }
    }

    // ==================== YOUTUBE CHANNEL ANALYSIS ====================
    case 'fogsift_youtube_channel_analyze': {
      const channelUrl = args.channel_url;
      const videoLimit = args.video_limit || 10;

      return {
        content: [{
          type: 'text',
          text: `🚧 Channel Analysis - Coming Soon\n\n` +
                `This feature will analyze:\n` +
                `- Channel metrics and growth\n` +
                `- Content strategy patterns\n` +
                `- Monetization strategies\n` +
                `- SEO patterns across videos\n` +
                `- Best performing content\n\n` +
                `For now, use fogsift_youtube_analyze on individual videos.`
        }]
      };
    }

    // ==================== YOUTUBE COMPETITOR COMPARISON ====================
    case 'fogsift_youtube_competitor_compare': {
      const channelUrls = args.channel_urls || [];

      if (channelUrls.length < 2) {
        return {
          content: [{
            type: 'text',
            text: '❌ Please provide at least 2 channel URLs to compare'
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: `🚧 Competitor Comparison - Coming Soon\n\n` +
                `This feature will:\n` +
                `- Compare channels side-by-side\n` +
                `- Identify content gaps\n` +
                `- Find monetization opportunities\n` +
                `- Benchmark performance\n\n` +
                `For now, analyze individual videos from each channel.`
        }]
      };
    }

    // ==================== YOUTUBE STRATEGIC RECOMMENDATIONS ====================
    case 'fogsift_youtube_strategy_recommend': {
      const analysisData = args.analysis_data;

      if (!analysisData) {
        return {
          content: [{
            type: 'text',
            text: '❌ Please provide analysis_data from youtube_analyze or youtube_channel_analyze'
          }],
          isError: true
        };
      }

      try {
        const recommendations = generateStrategicRecommendations({ channel: analysisData });

        let output = `💡 Strategic Recommendations\n`;
        output += `${'═'.repeat(60)}\n\n`;

        Object.entries(recommendations).forEach(([category, recs]) => {
          if (recs && recs.length > 0) {
            output += `${category.toUpperCase().replace('_', ' ')}\n`;
            output += `${'─'.repeat(60)}\n`;
            recs.forEach(rec => {
              output += `[${rec.priority.toUpperCase()}] ${rec.recommendation}\n`;
              output += `  → ${rec.action}\n\n`;
            });
          }
        });

        if (Object.values(recommendations).every(recs => !recs || recs.length === 0)) {
          output += `No specific recommendations at this time.\n`;
          output += `Continue analyzing videos to build recommendations.\n`;
        }

        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error generating recommendations: ${error.message}`
          }],
          isError: true
        };
      }
    }

    // ==================== YOUTUBE KEYWORD ANALYSIS ====================
    case 'fogsift_youtube_keyword_analyze': {
      const keyword = args.keyword;
      const limit = Math.min(args.limit || 10, 50); // Max 50 videos

      if (!keyword || keyword.trim().length === 0) {
        return {
          content: [{
            type: 'text',
            text: '❌ Please provide a keyword to search for'
          }],
          isError: true
        };
      }

      try {
        let output = `🔍 YouTube Keyword Analysis: "${keyword}"\n`;
        output += `${'═'.repeat(60)}\n\n`;

        output += `📊 Searching for top ${limit} videos...\n\n`;

        // Search for videos
        const searchResults = searchYouTube(keyword, limit);

        if (searchResults.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `❌ No videos found for keyword "${keyword}".\n\n` +
                    `Try:\n` +
                    `- Different keywords\n` +
                    `- Installing yt-dlp: pip install yt-dlp`
            }],
            isError: true
          };
        }

        output += `✅ Found ${searchResults.length} videos\n\n`;
        output += `📹 Analyzing videos...\n\n`;

        // Analyze each video (reuse the video analysis logic)
        const analyses = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < searchResults.length; i++) {
          const video = searchResults[i];
          output += `  [${i + 1}/${searchResults.length}] ${video.title.substring(0, 50)}...\n`;

          try {
            // Extract description using same method as video analyzer
            let description = '';
            let title = video.title;
            let channelName = video.channel;
            let viewCount = video.viewCount || 0;

            // Try yt-dlp first
            try {
              const ytdlpResult = runCommand(`yt-dlp --dump-json --no-warnings "${video.url}" 2>/dev/null`, process.cwd());
              if (ytdlpResult.success && ytdlpResult.output) {
                const videoData = JSON.parse(ytdlpResult.output);
                description = videoData.description || '';
                viewCount = videoData.view_count || viewCount;
              }
            } catch (e) {
              // Fallback to HTML
            }

            // Fallback to HTML if needed
            if (!description) {
              try {
                const htmlResult = runCommand(`curl -sL "${video.url}"`, process.cwd());
                if (htmlResult.success && htmlResult.output) {
                  const html = htmlResult.output;
                  const descMatch = html.match(/"shortDescription":"([^"]+)"/);
                  if (descMatch) {
                    description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                  }
                }
              } catch (e) {
                // Skip this video
                failCount++;
                continue;
              }
            }

            if (!description) {
              failCount++;
              continue;
            }

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

            const titleAnalysis = analyzeTitle(title, description);
            const insights = generateInsights(descriptionAnalysis, {
              viewCount,
              likeCount: 0,
              commentCount: 0
            });

            analyses.push({
              video_id: video.videoId,
              url: video.url,
              basic_metrics: {
                channel_name: channelName,
                video_title: title,
                view_count: viewCount,
                like_count: 0,
                comment_count: 0,
                upload_date: video.published || '',
                duration: video.duration || ''
              },
              description_analysis: {
                raw_description: description,
                ...descriptionAnalysis
              },
              title_analysis: titleAnalysis,
              strategic_insights: insights
            });

            successCount++;
          } catch (error) {
            failCount++;
            console.error(`Error analyzing ${video.title}:`, error.message);
          }
        }

        output += `\n✅ Successfully analyzed ${successCount} videos`;
        if (failCount > 0) {
          output += ` (${failCount} failed)`;
        }
        output += `\n\n`;

        if (analyses.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `❌ Could not analyze any videos. Please ensure yt-dlp is installed:\n\npip install yt-dlp`
            }],
            isError: true
          };
        }

        // Aggregate insights
        const aggregated = aggregateAnalyses(analyses);
        const bestPractices = extractBestPractices(analyses, aggregated);
        const opportunities = identifyOpportunities(analyses, aggregated);

        // Format aggregated report
        output += `📊 AGGREGATED INSIGHTS\n`;
        output += `${'═'.repeat(60)}\n\n`;

        output += `📝 DESCRIPTION PATTERNS\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Average Length: ${aggregated.description_patterns.avg_length} chars\n`;
        output += `  Average Sections: ${aggregated.description_patterns.avg_sections}\n`;
        output += `  Length Range: ${aggregated.description_patterns.length_range}\n\n`;

        output += `🔑 SEO PATTERNS\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Average SEO Score: ${aggregated.seo_patterns.avg_seo_score}/10\n`;
        output += `  Top Keywords:\n`;
        aggregated.seo_patterns.top_keywords.slice(0, 10).forEach(kw => {
          output += `    • ${kw.word} (${kw.count} videos, ${kw.percentage.toFixed(1)}%)\n`;
        });
        output += `\n`;

        output += `🔗 LINK PATTERNS\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Average Links: ${aggregated.link_patterns.avg_links}\n`;
        output += `  Most Common Category: ${aggregated.link_patterns.most_common_category}\n`;
        output += `  Categories:\n`;
        Object.entries(aggregated.link_patterns.categories).forEach(([cat, count]) => {
          output += `    • ${cat}: ${count} total links\n`;
        });
        output += `\n`;

        output += `📢 CTA PATTERNS\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Average CTAs: ${aggregated.cta_patterns.avg_ctas}\n`;
        output += `  Most Common Type: ${aggregated.cta_patterns.most_common_type}\n`;
        output += `  CTA Types:\n`;
        Object.entries(aggregated.cta_patterns.types).forEach(([type, count]) => {
          output += `    • ${type}: ${count} total\n`;
        });
        output += `\n`;

        output += `⏱️  TIMESTAMP USAGE\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Videos with Timestamps: ${aggregated.timestamp_usage.videos_with_timestamps}/${analyses.length}\n`;
        output += `  Usage Rate: ${aggregated.timestamp_usage.percentage.toFixed(1)}%\n\n`;

        output += `💰 MONETIZATION PATTERNS\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Most Common Strategy: ${aggregated.monetization_patterns.most_common}\n`;
        output += `  Strategies Used:\n`;
        Object.entries(aggregated.monetization_patterns.strategies).forEach(([strategy, count]) => {
          output += `    • ${strategy}: ${count} videos\n`;
        });
        output += `\n`;

        output += `📈 PERFORMANCE\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Average Views: ${aggregated.performance.avg_views.toLocaleString()}\n`;
        output += `  Total Views: ${aggregated.performance.total_views.toLocaleString()}\n`;
        if (aggregated.performance.top_performer) {
          output += `  Top Performer: "${aggregated.performance.top_performer.basic_metrics.video_title.substring(0, 50)}..."\n`;
          output += `    Views: ${aggregated.performance.top_performer.basic_metrics.view_count.toLocaleString()}\n`;
        }
        output += `\n`;

        // Best Practices
        output += `✅ BEST PRACTICES\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  Top 5 Performers:\n`;
        bestPractices.top_performers.forEach((tp, i) => {
          output += `    ${i + 1}. "${tp.title.substring(0, 50)}..." - ${tp.views.toLocaleString()} views (SEO: ${tp.seo_score.toFixed(1)}/10)\n`;
        });
        output += `\n`;

        if (bestPractices.seo_best_practices.length > 0) {
          output += `  Top SEO Practices:\n`;
          bestPractices.seo_best_practices.forEach((practice, i) => {
            output += `    ${i + 1}. "${practice.title.substring(0, 40)}..." (SEO: ${practice.seo_score}/10)\n`;
            output += `       First sentence: "${practice.first_sentence.substring(0, 60)}..."\n`;
            output += `       Keywords: ${practice.keywords.join(', ')}\n`;
          });
          output += `\n`;
        }

        // Opportunities
        if (opportunities.underserved_keywords.length > 0 || opportunities.missing_strategies.length > 0) {
          output += `💡 OPPORTUNITIES\n`;
          output += `${'─'.repeat(60)}\n`;

          if (opportunities.underserved_keywords.length > 0) {
            output += `  Underserved Keywords:\n`;
            opportunities.underserved_keywords.slice(0, 5).forEach(kw => {
              output += `    • ${kw} - used by top performers but not common\n`;
            });
            output += `\n`;
          }

          if (opportunities.missing_strategies.length > 0) {
            output += `  Missing Strategies:\n`;
            opportunities.missing_strategies.forEach(opp => {
              output += `    • ${opp.opportunity}\n`;
            });
            output += `\n`;
          }
        }

        // Recommendations
        if (bestPractices.recommendations.length > 0) {
          output += `💡 RECOMMENDATIONS\n`;
          output += `${'─'.repeat(60)}\n`;
          bestPractices.recommendations.forEach(rec => {
            output += `  [${rec.type.toUpperCase()}] ${rec.recommendation}\n`;
          });
          output += `\n`;
        }

        // Save aggregated report
        const reportData = {
          keyword,
          search_date: new Date().toISOString(),
          videos_analyzed: analyses.length,
          aggregated_insights: aggregated,
          best_practices: bestPractices,
          opportunities,
          individual_analyses: analyses.map(a => ({
            video_id: a.video_id,
            title: a.basic_metrics.video_title,
            views: a.basic_metrics.view_count,
            seo_score: a.description_analysis.keywords.seo_analysis.overall_seo_score,
            monetization_strategy: a.description_analysis.monetization.monetization_strategy
          }))
        };

        const reportPath = path.join(FOGSIFT_ROOT, 'content/tech-teardowns/analyses');
        if (!fs.existsSync(reportPath)) {
          fs.mkdirSync(reportPath, { recursive: true });
        }
        const reportFilename = `keyword-analysis-${keyword.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
        fs.writeFileSync(
          path.join(reportPath, reportFilename),
          JSON.stringify(reportData, null, 2)
        );

        output += `${'═'.repeat(60)}\n`;
        output += `📁 Full report saved to: ${reportFilename}\n`;
        output += `📊 Individual analyses: ${analyses.length} videos analyzed\n`;

        return {
          content: [{
            type: 'text',
            text: output
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error analyzing keyword: ${error.message}\n\nStack: ${error.stack}`
          }],
          isError: true
        };
      }
    }

    // ==================== STATUS ====================
    case 'fogsift_status': {
      let output = '📊 FogSift Status\n';
      output += '═'.repeat(50) + '\n\n';

      // Git status
      const gitResult = runCommand('git status --short');
      output += '📁 Git Status:\n';
      output += gitResult.success
        ? (gitResult.output || '  (clean)') + '\n'
        : '  Could not get git status\n';
      output += '\n';

      // Queue stats
      const queue = loadQueue();
      if (queue) {
        output += '📋 Queue Stats:\n';
        output += `  In Queue: ${queue.stats.in_queue}\n`;
        output += `  Completed: ${queue.stats.completed}\n`;
        output += `  Total Submitted: ${queue.stats.total_submitted}\n`;
        output += `  Mock Data: ${queue.meta.is_mock_data ? 'Yes' : 'No'}\n`;
        output += '\n';
      }

      // Check if dev server is running
      try {
        execSync('lsof -ti:5050', { encoding: 'utf8' });
        output += '🖥️  Dev Server: Running on http://localhost:5050\n';
      } catch (e) {
        output += '🖥️  Dev Server: Not running\n';
      }

      // Last build time
      const distPath = path.join(FOGSIFT_ROOT, 'dist');
      if (fs.existsSync(distPath)) {
        const stat = fs.statSync(distPath);
        output += `🔨 Last Build: ${stat.mtime.toLocaleString()}\n`;
      }

      return {
        content: [{
          type: 'text',
          text: output
        }]
      };
    }

    default:
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${name}`
        }],
        isError: true
      };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FogSift Manager MCP server running...');
}

main().catch(console.error);
