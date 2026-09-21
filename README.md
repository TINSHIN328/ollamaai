# ✦ AI Hub

A modern, dark-themed AI web application that connects to a local Ollama server. Features a ChatGPT-style interface with separate AI workspaces for general chat, Minecraft development, and coding assistance.

![AI Hub](https://img.shields.io/badge/AI-Hub-purple) ![Ollama](https://img.shields.io/badge/Ollama-qwen3:8b-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **General AI** - Chat, explain topics, writing assistance, translation, summarization
- **Minecraft AI** - Mod Builder, Plugin Builder, Code Assistant, Error Fixer
- **Coding AI** - Code Generator, Debugger, Code Explainer, Optimizer, Linux Assistant
- **ChatGPT-style Interface** - Markdown rendering, code blocks, copy buttons
- **Chat History** - Persistent chat sessions per workspace
- **Streaming Responses** - Real-time token streaming from Ollama
- **File Generation** - Generate complete mod/plugin projects with file explorer
- **ZIP Download** - Download generated projects as ZIP files
- **Dark Theme** - Professional dark UI with smooth animations
- **Responsive Design** - Works on desktop and mobile
- **Settings** - Configurable model, temperature, context size

## Prerequisites

- **Node.js** 18+ installed
- **Ollama** running locally with at least one model pulled

Install Ollama from [ollama.ai](https://ollama.ai) and pull a model:

```bash
ollama pull qwen3:8b
```

## Installation

```bash
# Clone or download the project
cd ai-hub

# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server (serves both frontend and API)
npm start
```

Then open your browser to:

```
http://localhost:22896
```

### Quick Start (Development)

For development with hot-reload:

```bash
npm run dev    # Frontend dev server on port 3000
npm start      # Backend API server on port 22896
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `22896` | Web server port |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen3:8b` | Default AI model |

### Start with custom settings

```bash
OLLAMA_MODEL=qwen3:8b PORT=22896 npm start
```

### Using .env file

Copy `.env.example` to `.env` and modify values:

```bash
cp .env.example .env
```

## Production Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name ai-hub

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# View logs
pm2 logs ai-hub

# Restart
pm2 restart ai-hub

# Stop
pm2 stop ai-hub
```

## Accessing Remotely

The server binds to `0.0.0.0` by default, so it's accessible from other machines:

```
http://YOUR_SERVER_IP:22896
```

Make sure your firewall allows the port:

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22896/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 22896 -j ACCEPT
```

## Project Structure

```
ai-hub/
├── server.js              # Express backend server
├── package.json           # Dependencies
├── README.md              # This file
├── .env.example           # Environment variables template
├── src/                   # React frontend source
│   ├── App.tsx            # Main application
│   ├── index.css          # Styles
│   ├── main.tsx           # Entry point
│   ├── components/        # UI components
│   │   ├── Sidebar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── GeneralAI.tsx
│   │   ├── Settings.tsx
│   │   ├── minecraft/     # Minecraft tools
│   │   │   ├── MinecraftDashboard.tsx
│   │   │   ├── ModBuilder.tsx
│   │   │   ├── PluginBuilder.tsx
│   │   │   ├── MinecraftCodeAssistant.tsx
│   │   │   └── ErrorFixer.tsx
│   │   └── coding/        # Coding tools
│   │       ├── CodingDashboard.tsx
│   │       ├── CodeGenerator.tsx
│   │       ├── Debugger.tsx
│   │       ├── CodeExplainer.tsx
│   │       ├── Optimizer.tsx
│   │       └── LinuxAssistant.tsx
│   └── utils/             # Utilities
│       ├── api.ts         # API client
│       ├── storage.ts     # Local storage
│       └── prompts.ts     # System prompts
├── public/                # Static assets
└── dist/                  # Built frontend (generated)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check Ollama status |
| GET | `/api/models` | List available models |
| POST | `/api/chat` | Chat with message history |
| POST | `/api/generate` | Simple text generation |

### POST /api/chat

```json
{
  "model": "qwen3:8b",
  "messages": [
    { "role": "system", "content": "You are helpful." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "stream": true
}
```

## Security

- Ollama remains bound to localhost only
- Browser communicates only with the Node.js backend
- API input is validated
- Request body size is limited to 10MB
- AI-generated code is never executed automatically
- Environment variables are never exposed to the frontend

## Troubleshooting

### "Ollama is offline"

Make sure Ollama is running:

```bash
ollama serve
```

Or check if it's already running:

```bash
curl http://127.0.0.1:11434/api/tags
```

### Model not found

Pull the model first:

```bash
ollama pull qwen3:8b
```

### Port already in use

Change the port:

```bash
PORT=3000 npm start
```

## License

MIT
