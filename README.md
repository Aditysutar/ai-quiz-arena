# AI Quiz Arena

> **Real-Time Multiplayer Quiz Arena Powered by Google Gemini AI and Socket.IO**  
> Developed for the **Handshake AI Monthly Challenge**.

AI Quiz Arena is a production-ready, full-stack multiplayer web application. Players can create customized quiz rooms, choose from curated topics or enter any custom subject, and compete in real time over synchronized WebSockets with live countdown timers, speed-bonus scoring, round-by-round reveals, and instant leaderboards.

Quiz questions are dynamically generated on the fly via the **Google Gemini API** (using models like `gemini-3.5-flash-lite`, `gemini-3.5-flash`, and `gemini-3.8-flash`). If Gemini is offline, rate-limited, or misconfigured, the server seamlessly falls back to a built-in verified question bank while transparently informing players.

---

## 1. Key Features

- **Dynamic AI Question Generation**: Leverages Google Gemini to create fresh, engaging 4-option multiple-choice questions on any standard or custom topic.
- **Fail-Safe Question Bank**: Built-in 80+ item curated question bank across 8 categories (General Knowledge, Science, Technology, History, Geography, Sports, Movies, Mathematics).
- **Synchronized Multiplayer**: Real-time room management via Socket.IO supporting up to 12 players per room with a 2-player minimum to start.
- **Live Answer Progress**: Instant visual feedback showing how many players have submitted answers in real time.
- **Server-Side Scoring & Security**:
  - Base award: **100 points** for correct answers.
  - Speed bonus: Up to **+50 bonus points** proportional to the remaining time.
  - 0 points for incorrect or unanswered questions.
  - Correct answers are strictly held on the server until the round closes—never exposed in advance.
- **Reconnect Resilience**: 90-second session token reconnection window preserves player scores and active room states across accidental page refreshes.
- **Tournament-Grade Dark Theme**: Custom dark UI built with Tailwind CSS, Lucide icons, glassmorphism, responsive mobile/tablet/desktop layouts, and smooth animations.
- **Optional Match History**: Seamless MongoDB Atlas integration for match history without blocking zero-dependency in-memory gameplay.
- **Zero-Cost Deployment**: Ready for immediate deployment on Render's free Web Service tier.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│    React 19 + Vite + Tailwind CSS + Lucide Icons            │
│    - Room Creation & Topic/Difficulty/Count Selection       │
│    - Monospace Room Code Entry & One-Click Invite Links     │
│    - Synchronized Timer, Live Leaderboard & Round Reveal    │
└──────────────────────────────▲──────────────────────────────┘
                               │
                WebSocket / HTTP Polling (Socket.IO)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js + Express Backend                │
│    - Room State Machine & Concurrency Control               │
│    - Event Rate Limiting & Input Sanitization               │
│    - Server-Side Scoring & Timer Synchronization            │
│    - Static File Serving for Production Vite Build          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    HTTP POST (Server-Side)        Optional Mongoose/MongoDB
                │                             │
┌───────────────▼───────────────┐ ┌───────────▼───────────────┐
│     Google Gemini API         │ │      MongoDB Atlas        │
│  gemini-3.5-flash-lite / flash │ │  (Optional Match History) │
│  Fallback: Question Bank      │ │  (In-Memory if unset)     │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend Framework** | React 19, Vite 6 | Fast reactive UI, single-page application |
| **Styling & UI** | Tailwind CSS 3, Lucide React | Modern dark gaming theme, glowing accents, accessible icons |
| **Backend Runtime** | Node.js (>= 18.18.0), Express 5 | High-performance API routing and static asset serving |
| **Real-Time Engine** | Socket.IO 4.8 | Bidirectional event synchronization, room channels, reconnection |
| **AI Integration** | Google Gemini API (`generateContent`) | Structured JSON question generation, multi-model fallback |
| **Database (Optional)** | MongoDB Atlas (Node driver 6.20) | Match result persistence and match history |
| **Hosting Target** | GitHub + Render Web Service | Single-dyno full-stack web service |

---

## 4. Project Structure

```text
quiz/
├── client/                     # Frontend React Source
│   ├── public/                 # Static public assets (favicon.svg)
│   ├── src/
│   │   ├── App.jsx             # Main SPA router, 9 screens & game logic
│   │   ├── index.css           # Tailwind base, components, and animations
│   │   ├── main.jsx            # React root DOM mount
│   │   ├── socket.js           # Socket.IO client singleton
│   │   └── topics.js           # Topic, difficulty, and question count presets
│   └── index.html              # HTML entry template with Sora & Manrope fonts
├── server/                     # Backend Source
│   ├── config.js               # Environment parsing & model fallback priority
│   ├── db.js                   # MongoDB connection & optional persistence
│   ├── gemini.js               # Gemini API client, JSON schema prompt & fallbacks
│   ├── index.js                # Express app, HTTP endpoints & static file serving
│   ├── questionBank.js         # Curated 80+ item fallback question repository
│   ├── rateLimit.js            # IP-based sliding window rate limiter
│   ├── rooms.js                # In-memory room manager, timer & scoring store
│   ├── scoring.js              # Server-side base + speed bonus scoring logic
│   ├── socketHandlers.js       # Socket.IO event router & cheating prevention
│   └── validate.js             # Input sanitization, token & room code generation
├── tests/                      # Automated Test Suite (Node.js Test Runner)
│   ├── game.test.js            # Multiplayer game flows, sockets, rooms & health
│   └── questions.test.js       # AI generation, fallback bank, scoring & sanitization
├── dist/                       # Production frontend build (generated by vite build)
├── .env.example                # Documented environment variable template
├── .gitignore                  # Git ignore rules for node_modules, .env & logs
├── package.json                # Project dependencies, scripts & Node engines
├── Procfile                    # Process declaration for web deployments
├── render.yaml                 # Render Blueprint specification
├── tailwind.config.js          # Tailwind theme configuration
└── vite.config.js              # Vite bundler configuration & dev server proxy
```

---

## 5. Local Setup & Development

### Prerequisites
- **Node.js**: `v18.18.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USER/ai-quiz-arena.git
cd ai-quiz-arena
npm install
```

### 2. Configure Environment Variables
Copy the example file to `.env`:
```bash
# On Linux / macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Edit `.env` and supply your Gemini API key:
```ini
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

### 3. Run in Development Mode
To run the server and client concurrently with hot reloading:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Health Endpoint**: [http://localhost:3000/health](http://localhost:3000/health)

### 4. Run in Production Mode Locally
Build the Vite frontend and run the production Express server:
```bash
npm run build
npm start
```
Then open [http://localhost:3000](http://localhost:3000).

---

## 6. Google Gemini API Integration

1. Generate a free API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Set `GEMINI_API_KEY` in your `.env` file or hosting environment variables.
3. Recommended Model: `gemini-3.5-flash-lite` (generates 10-15 questions in 2-4 seconds).

### Fallback Priority Chain
When generating questions, the server sequentially attempts:
1. Configured model (`GEMINI_MODEL`, default `gemini-3.5-flash-lite`)
2. `gemini-3.5-flash`
3. `gemini-3.8-flash`
4. `gemini-3.7-flash`
5. `gemini-flash-latest`
6. Built-in verified question bank (`source: 'fallback'`)

If the API key is absent, rate-limited, or Google's API experiences temporary service spikes (HTTP 503), the application seamlessly uses the built-in question bank and displays an honest notice to the room. Fallback questions are never misrepresented as AI-generated.

---

## 7. Security & Fair Play Design

- **Server-Side Authority**: Scores, timers, answer evaluations, and winner declarations occur strictly on the backend.
- **Anti-Cheat Question Concealment**: The correct answer index and explanation are completely stripped from client payloads until the question countdown closes.
- **Duplicate Answer Prevention**: Submissions are idempotently locked per round; subsequent attempts are rejected by the server.
- **Host Role Protection**: Only the verified room host can trigger match start. If the host disconnects, host authority is automatically transferred to the next active player.
- **Rate Limiting**: Sliding-window rate limiters prevent connection flooding and excessive room allocations.

---

## 8. Automated Testing

The project includes comprehensive automated unit, integration, and full-match end-to-end tests:

```bash
# Run unit and integration tests (14 tests)
npm test

# Run full end-to-end two-player multiplayer simulation (real WebSocket match)
npm run test:e2e
```

### Verified Test Cases (14/14 Passing):
- **Health Check**: `/health` endpoint responds 200 OK with service identifier.
- **System Status**: `/api/status` accurately reports Gemini and database connectivity.
- **Persistence Fallback**: `/api/history` returns structured response without MongoDB.
- **Minimum Player Rule**: Starting a match with fewer than 2 players is rejected.
- **Two-Player Multiplayer**: Full end-to-end synchronized game loop with server-side scoring.
- **Reconnect Handling**: Players successfully reconnect using their unique session token.
- **Room Validation**: Rejects malformed room codes and duplicate player names.
- **Host Permissions**: Non-hosts are prevented from starting the game.
- **Fallback Bank Integrity**: Returns exact requested count (5, 10, 15) of unique questions across all topics.
- **Question Sanitizer**: Rejects malformed items, duplicate questions, and invalid choices.
- **Scoring Engine**: Exact base points (100) + speed bonus (+0 to +50) calculated by elapsed time.
- **Gemini AI Generation**: Generates valid questions with 4 options and explanations.
- **Missing API Key Handling**: Graceful fallback when API key is empty.
- **Input Sanitization**: Room code, player name, count, and difficulty validators.

---

## 9. Deployment to Render (Free Web Service)

This application is architected to deploy cleanly on **Render's Free Web Service tier** as a single combined service.

### Step-by-Step Instructions:

1. **Push to GitHub**:
   Ensure `.env` is **NOT** committed (verified in `.gitignore`):
   ```bash
   git add .
   git commit -m "Prepare AI Quiz Arena for deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** -> **Web Service**.
   - Connect your GitHub repository.

3. **Configure Service Settings**:
   - **Name**: `ai-quiz-arena` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Plan**: `Free`
   - **Build Command**:
     ```bash
     npm install --include=dev && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Health Check Path**: `/health`

4. **Set Environment Variables in Render Dashboard**:
   In the **Environment** tab of your Render service, add:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `Your_Google_Gemini_API_Key`
   - `GEMINI_MODEL` = `gemini-3.5-flash-lite`
   - *(Optional)* `MONGODB_URI` = `mongodb+srv://...` (Leave blank if not using MongoDB)

5. **Deploy & Verify**:
   - Click **Deploy Web Service**.
   - Once deployed, visit `https://<YOUR-RENDER-APP>.onrender.com/health` to confirm `{ ok: true }`.
   - Open the main URL in two separate browser windows or devices and play a live multiplayer quiz!

---

## 10. Known Limitations & Production Considerations

- **Server Restarts**: Active game state lives in server memory. On Render free dynos, idle sleep or dyno restarts will clear currently active rooms.
- **Free Tier Cold Starts**: Render's free tier spins down after 15 minutes of inactivity. The initial request may take 30-50 seconds to wake up.
- **Gemini Free Quotas**: Google AI Studio's free tier enforces rate limits. If exceeded, the app automatically switches to the built-in question bank.
- **Reconnection Window**: The reconnect window is configured to 90 seconds. If a disconnected player does not return within 90 seconds, their slot is freed.

---

## 11. License

MIT License. Developed for the Handshake AI Monthly Challenge.
