/**
 * AI Hub - Backend Server
 * 
 * This server acts as a proxy between the frontend and Ollama.
 * It never exposes Ollama directly to the browser.
 * 
 * Environment Variables:
 *   PORT          - Web server port (default: 22896)
 *   OLLAMA_URL    - Ollama server URL (default: http://127.0.0.1:11434)
 *   OLLAMA_MODEL  - Default model (default: qwen3:8b)
 */

const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = parseInt(process.env.PORT || '22896', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the built frontend
// After running `npm run build`, files are in dist/
// For development, you can also put files in public/
const staticDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.use(express.static(publicDir));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Request timeout
const OLLAMA_TIMEOUT = 120000; // 2 minutes

/**
 * Make a request to Ollama API
 */
function ollamaRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(OLLAMA_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: OLLAMA_TIMEOUT,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          // Handle streaming responses (newline-delimited JSON)
          if (body?.stream) {
            resolve({ streaming: true, raw: data });
          } else {
            resolve(JSON.parse(data));
          }
        } catch (e) {
          reject(new Error('Failed to parse Ollama response'));
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        reject(new Error('Ollama is offline. Please start Ollama and try again.'));
      } else {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request to Ollama timed out'));
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Check Ollama health
 */
function checkOllamaHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(OLLAMA_URL + '/api/tags');
    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: 'online', models: parsed.models?.map(m => m.name) || [] });
        } catch {
          resolve({ status: 'online' });
        }
      });
    });

    req.on('error', () => resolve({ status: 'offline' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'offline' }); });
    req.end();
  });
}

// ============ API ROUTES ============

/**
 * GET /api/health
 * Check if Ollama is running
 */
app.get('/api/health', async (req, res) => {
  try {
    const health = await checkOllamaHealth();
    res.json(health);
  } catch {
    res.json({ status: 'offline' });
  }
});

/**
 * GET /api/models
 * List available Ollama models
 */
app.get('/api/models', async (req, res) => {
  try {
    const health = await checkOllamaHealth();
    res.json({ models: health.models || [], default: DEFAULT_MODEL });
  } catch {
    res.json({ models: [], default: DEFAULT_MODEL });
  }
});

/**
 * POST /api/chat
 * Chat completion with message history
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature, stream } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate messages
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ error: 'Each message must have role and content' });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return res.status(400).json({ error: 'Invalid message role' });
      }
    }

    const ollamaBody = {
      model: model || DEFAULT_MODEL,
      messages: messages,
      stream: stream || false,
      options: {
        temperature: temperature !== undefined ? temperature : 0.7,
      },
    };

    if (stream) {
      // Streaming response
      const url = new URL(OLLAMA_URL + '/api/chat');
      const options = {
        hostname: url.hostname,
        port: url.port || 11434,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: OLLAMA_TIMEOUT,
      };

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const ollamaReq = http.request(options, (ollamaRes) => {
        ollamaRes.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(l => l.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              res.write(`data: ${JSON.stringify(parsed)}\n\n`);
              if (parsed.done) {
                res.write('data: [DONE]\n\n');
                res.end();
              }
            } catch {}
          }
        });
        ollamaRes.on('end', () => {
          res.write('data: [DONE]\n\n');
          res.end();
        });
      });

      ollamaReq.on('error', (err) => {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      });

      req.on('close', () => { ollamaReq.destroy(); });
      ollamaReq.write(JSON.stringify(ollamaBody));
      ollamaReq.end();
    } else {
      // Non-streaming response
      const result = await ollamaRequest('/api/chat', ollamaBody);
      res.json(result);
    }
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to communicate with Ollama' });
  }
});

/**
 * POST /api/generate
 * Simple text generation (no message history)
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, system, model, temperature, stream } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ollamaBody = {
      model: model || DEFAULT_MODEL,
      prompt: prompt,
      system: system || '',
      stream: stream || false,
      options: {
        temperature: temperature !== undefined ? temperature : 0.7,
      },
    };

    const result = await ollamaRequest('/api/generate', ollamaBody);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to communicate with Ollama' });
  }
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(staticDir, 'index.html');
    const publicIndexPath = path.join(publicDir, 'index.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else if (fs.existsSync(publicIndexPath)) {
      res.sendFile(publicIndexPath);
    } else {
      res.status(404).json({ error: 'Frontend not built. Run `npm run build` first.' });
    }
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║           ✦ AI Hub Server               ║
╠══════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(29)}║
║  Ollama:   ${OLLAMA_URL.padEnd(29)}║
║  Model:    ${DEFAULT_MODEL.padEnd(29)}║
║  URL:      http://0.0.0.0:${String(PORT).padEnd(15)}║
╚══════════════════════════════════════════╝
  `);
});
