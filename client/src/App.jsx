import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  Copy,
  Crown,
  Flame,
  Globe,
  History,
  Info,
  Loader2,
  LogOut,
  Play,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import { socket } from './socket.js';
import { COUNTS, DIFFICULTIES, TOPICS } from './topics.js';

const TOKEN_KEY = 'aqa_reconnect_token';

function formatCode(code) {
  const str = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return str.length === 6 ? `${str.slice(0, 3)} ${str.slice(3)}` : str;
}

function timeLeft(endsAt) {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

// -------------------------------------------------------------
// Component: Banner & Network Status
// -------------------------------------------------------------
function Banner({ connection, error, notice, onDismissError, onDismissNotice }) {
  return (
    <div className="flex flex-col gap-2.5">
      {connection !== 'connected' && (
        <div className="flex items-center justify-between rounded-2xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 text-sm text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="animate-pulse" />
            <span>Connection to arena server lost. Reconnecting automatically...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-sm text-rose-100 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onDismissError && (
            <button onClick={onDismissError} className="text-rose-300 hover:text-white p-1 rounded-lg">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between rounded-2xl bg-sky-500/15 border border-sky-500/30 px-4 py-3 text-sm text-sky-100 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Info size={18} className="text-sky-400 shrink-0" />
            <span>{notice}</span>
          </div>
          {onDismissNotice && (
            <button onClick={onDismissNotice} className="text-sky-300 hover:text-white p-1 rounded-lg">
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Screen 1: Home / Landing Page
// -------------------------------------------------------------
function Home({ onCreate, onJoin, onHistory, serverStatus }) {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="card p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-violet-600/20 to-sky-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
            Quiz <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">Arena</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Create multiplayer quiz rooms, challenge your friends, test your knowledge across different topics, and compete in exciting real-time quiz battles.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
            <button className="btn-primary text-base px-6 py-3.5 shadow-lg shadow-violet-600/20" onClick={onCreate}>
              <Play size={18} /> Create Quiz Room
            </button>
            <button className="btn-secondary text-base px-6 py-3.5" onClick={onJoin}>
              <Users size={18} /> Join with Room Code
            </button>
            <button className="btn-ghost text-base px-5 py-3.5" onClick={onHistory}>
              <History size={18} /> Match History
            </button>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multiplayer Sockets: <strong className="text-slate-200">Online</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-sky-400" />
            <span>Persistence: <strong className="text-slate-200">{serverStatus?.mongoConnected ? 'MongoDB Connected' : 'In-Memory MVP'}</strong></span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-subtle p-6 hover:border-violet-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-300 mb-4">
            <Zap size={24} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Real-Time Sync</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Sub-second Socket.IO synchronized gameplay for 2 to 12 players with live countdown timers.
          </p>
        </div>

        <div className="card-subtle p-6 hover:border-sky-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300 mb-4">
            <Brain size={24} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Specific Topic Quiz Generation</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Generate quiz questions across standard categories or custom topics of your choice.
          </p>
        </div>

        <div className="card-subtle p-6 hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-4">
            <Clock size={24} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Speed Bonus</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            100 base points for correct answers plus up to 50 bonus points depending on your response speed.
          </p>
        </div>

        <div className="card-subtle p-6 hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Live Leaderboard</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Watch standings shift round-by-round and celebrate the champion on the final victory podium.
          </p>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// Screen 2: Create Quiz Room
// -------------------------------------------------------------
function CreateForm({ onSubmit, onBack, busy }) {
  const [playerName, setPlayerName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-10 relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Room Configuration</p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Create Quiz Room</h2>
        </div>
        <button type="button" onClick={onBack} className="btn-ghost text-sm px-3 py-1.5">
          <X size={18} /> Cancel
        </button>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            playerName: playerName.trim(),
            topic: customTopic.trim() || topic,
            difficulty,
            questionCount
          });
        }}
      >
        {/* Player Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Your Player Name <span className="text-rose-400">*</span>
          </label>
          <input
            className="field"
            placeholder="e.g., Alex, QuizMaster, StarGazer"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={24}
            required
            autoFocus
          />
        </div>

        {/* Topic Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Select Category or Topic
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {TOPICS.map((item) => (
              <button
                type="button"
                key={item}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all text-left truncate ${
                  topic === item && !customTopic ? 'border-violet-400 bg-violet-500/25 text-white font-semibold shadow-sm' : 'border-white/10 bg-black/20 text-slate-300 hover:bg-white/5'
                }`}
                onClick={() => {
                  setTopic(item);
                  setCustomTopic('');
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <input
            className="field text-sm"
            placeholder="Or enter a custom topic (e.g. Marvel Movies, Quantum Physics, 90s Rock)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            maxLength={60}
          />
          {customTopic.trim() && (
            <p className="text-xs text-violet-300 mt-1.5 flex items-center gap-1.5">
              <Sparkles size={12} /> Google Gemini AI will generate questions custom-tailored to: <strong>"{customTopic.trim()}"</strong>
            </p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Difficulty Tier
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DIFFICULTIES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`option text-center py-3 ${
                  difficulty === item.id ? 'border-violet-400 bg-violet-500/25 text-white shadow-sm' : 'text-slate-300'
                }`}
                onClick={() => setDifficulty(item.id)}
              >
                <div className="font-semibold text-sm">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Number of Questions
          </label>
          <div className="grid grid-cols-3 gap-3">
            {COUNTS.map((count) => (
              <button
                type="button"
                key={count}
                className={`option text-center py-3 ${
                  questionCount === count ? 'border-sky-400 bg-sky-500/25 text-white shadow-sm' : 'text-slate-300'
                }`}
                onClick={() => setQuestionCount(count)}
              >
                <div className="font-bold text-lg">{count}</div>
                <div className="text-xs text-slate-400">Questions</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button className="btn-primary flex-1 text-base py-3.5" disabled={busy || !playerName.trim()}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {busy ? 'Creating Arena Room...' : 'Launch Quiz Arena'}
          </button>
          <button type="button" className="btn-secondary sm:w-28" onClick={onBack} disabled={busy}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// Screen 3: Join Room Screen
// -------------------------------------------------------------
function JoinForm({ onSubmit, onBack, initialCode, busy }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(initialCode || '');

  return (
    <div className="card mx-auto max-w-lg p-6 sm:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">Multiplayer Match</p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Join Quiz Room</h2>
        </div>
        <button type="button" onClick={onBack} className="btn-ghost text-sm px-3 py-1.5">
          <X size={18} /> Cancel
        </button>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            playerName: playerName.trim(),
            roomCode: roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
          });
        }}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Your Player Name <span className="text-rose-400">*</span>
          </label>
          <input
            className="field"
            placeholder="e.g., Challenger, Robin, Maverick"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={24}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            6-Character Room Code <span className="text-rose-400">*</span>
          </label>
          <input
            className="field font-mono text-center tracking-[0.3em] uppercase text-2xl font-bold py-3.5"
            placeholder="ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 7))}
            maxLength={7}
            required
          />
          <p className="mt-1.5 text-xs text-slate-400 text-center">
            Ask the room host for their 6-character room code.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            className="btn-primary flex-1 text-base py-3.5"
            disabled={busy || !playerName.trim() || roomCode.trim().length < 6}
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
            {busy ? 'Connecting to Room...' : 'Enter Arena'}
          </button>
          <button type="button" className="btn-secondary sm:w-28" onClick={onBack} disabled={busy}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Player List
// -------------------------------------------------------------
function PlayerList({ players, playerId }) {
  return (
    <div className="space-y-2">
      {players.map((player) => {
        const isYou = player.id === playerId;
        return (
          <div
            key={player.id}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
              isYou ? 'bg-violet-500/20 border border-violet-500/40 shadow-sm' : 'bg-black/30 border border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  player.isHost ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/60 text-slate-200'
                }`}>
                  {player.name.slice(0, 2).toUpperCase()}
                </div>
                {player.connected ? (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-500 rounded-full border-2 border-slate-900" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span>{player.name}</span>
                  {player.isHost && (
                    <span title="Room Host">
                      <Crown size={14} className="text-amber-400" />
                    </span>
                  )}
                  {isYou && (
                    <span className="rounded-md bg-violet-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-semibold text-slate-300">{player.score} pts</div>
              <div className="text-slate-500">{player.connected ? 'online' : 'away'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// Screen 4: Waiting Lobby
// -------------------------------------------------------------
function Lobby({ room, playerId, onStart, onLeave, busy }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const me = room.players.find((player) => player.id === playerId);
  const isHost = Boolean(me?.isHost);
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = isHost && connectedCount >= 2;

  function handleCopyCode() {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    const inviteUrl = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Column: Match Details & Controls */}
      <section className="card p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">Waiting Room</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              {connectedCount} / 12 Players
            </span>
          </div>

          {/* Big Room Code Display */}
          <div className="my-6 rounded-3xl bg-black/40 border border-white/10 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Room Code</p>
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-[0.25em] text-white">
              {formatCode(room.code)}
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                className="btn-secondary text-xs px-3.5 py-2"
                onClick={handleCopyCode}
              >
                {copiedCode ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedCode ? 'Code Copied!' : 'Copy Code'}
              </button>
              <button
                type="button"
                className="btn-secondary text-xs px-3.5 py-2"
                onClick={handleCopyLink}
              >
                {copiedLink ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
              </button>
            </div>
          </div>

          {/* Configuration Chips */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Topic:</span>
              <span className="font-semibold text-slate-200">{room.topic}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Difficulty:</span>
              <span className="font-semibold capitalize text-slate-200">{room.difficulty}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Total Questions:</span>
              <span className="font-semibold text-slate-200">{room.questionCount} Questions</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Time per Question:</span>
              <span className="font-semibold text-slate-200">{Math.round(room.timeLimitMs / 1000)} Seconds</span>
            </div>
          </div>
        </div>

        {/* Start / Leave Action Area */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          {isHost ? (
            <div>
              <button
                className="btn-primary w-full text-base py-3.5"
                onClick={onStart}
                disabled={busy || !canStart}
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                {busy ? 'Generating Questions with Gemini AI...' : 'Start Quiz Match'}
              </button>
              {!canStart && (
                <p className="mt-2 text-xs text-amber-300 text-center">
                  At least 2 connected players are required to start the match.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <Loader2 size={16} className="animate-spin text-sky-400" />
                <span>Waiting for the host to start the quiz...</span>
              </div>
            </div>
          )}

          <button className="btn-ghost w-full text-sm text-slate-400 hover:text-rose-300" onClick={onLeave}>
            <LogOut size={16} /> Leave Room
          </button>
        </div>
      </section>

      {/* Right Column: Player Roster */}
      <aside className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-violet-400" />
            Connected Players
          </h3>
          <span className="text-xs text-slate-400">{room.players.length} registered</span>
        </div>
        <PlayerList players={room.players} playerId={playerId} />
      </aside>
    </div>
  );
}

// -------------------------------------------------------------
// Screen 5 & 6: Quiz Screen & Question Reveal State
// -------------------------------------------------------------
function QuizScreen({
  room,
  question,
  playerId,
  selected,
  locked,
  onAnswer,
  result,
  seconds,
  answerProgress
}) {
  const progressPercent = question ? ((question.index + 1) / question.total) * 100 : 0;
  const isTimeCritical = seconds <= 5 && !result;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      {/* Main Question Arena Card */}
      <section className="card p-6 sm:p-8 relative flex flex-col justify-between">
        <div>
          {/* Top Header: Question count, Timer, Score */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Question {question.index + 1}</span>
              <span className="text-slate-500">/ {question.total}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-300 ml-2">
                {room.topic}
              </span>
            </div>

            {/* Synchronized Timer Pill */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-bold transition-all ${
                result
                  ? 'bg-slate-700/50 text-slate-400'
                  : isTimeCritical
                  ? 'bg-rose-500/25 border border-rose-500 text-rose-300 animate-pulse'
                  : seconds <= 10
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                  : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
              }`}
            >
              <Clock size={15} />
              <span>{result ? 'Round Over' : `${seconds}s`}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-black/40 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-sky-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Live Answer Progress Tracker */}
          {answerProgress && !result && (
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400 bg-white/[0.03] rounded-xl px-3.5 py-2">
              <span>Live Player Progress:</span>
              <span className="font-semibold text-slate-200">
                {answerProgress.answeredCount} of {answerProgress.totalPlayers} answered
              </span>
            </div>
          )}

          {/* Question Text */}
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
            {question.question}
          </h2>

          {/* 4 Options Grid */}
          <div className="mt-6 grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = result && index === result.correctIndex;
              const isWrong = result && isSelected && !result.yourAnswer?.correct;

              let optionStyle = 'border-white/10 bg-black/30 hover:border-violet-500/40 hover:bg-white/[0.06] text-slate-200';

              if (result) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-100 shadow-md shadow-emerald-500/10 font-semibold';
                } else if (isWrong) {
                  optionStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 font-semibold';
                } else {
                  optionStyle = 'border-white/5 bg-black/20 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'border-sky-400 bg-sky-500/20 text-white shadow-md shadow-sky-500/15 font-semibold';
              }

              return (
                <button
                  key={`${option}-${index}`}
                  className={`option ${optionStyle}`}
                  disabled={locked || Boolean(result)}
                  onClick={() => onAnswer(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-500 text-black'
                          : isWrong
                          ? 'bg-rose-500 text-white'
                          : isSelected
                          ? 'bg-sky-400 text-black'
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm sm:text-base">{option}</span>
                    </div>

                    {result && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                    {result && isWrong && <XCircle size={18} className="text-rose-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Round Feedback / Reveal State */}
        {result ? (
          <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2">
              {result.yourAnswer?.correct ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 size={18} />
                  <span>Correct! +{result.yourAnswer.points} pts ({result.yourAnswer.speedBonus} speed bonus)</span>
                </div>
              ) : result.yourAnswer ? (
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <XCircle size={18} />
                  <span>Incorrect (0 points awarded)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock size={18} />
                  <span>Time expired without answer</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-slate-100">Explanation: </strong>
              {result.explanation}
            </p>
          </div>
        ) : locked && selected !== null ? (
          <div className="mt-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 p-3.5 text-center text-xs text-sky-200">
            Answer submitted and locked! Waiting for timer or remaining players...
          </div>
        ) : null}
      </section>

      {/* Right Column: Live Leaderboard */}
      <aside className="card p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              Live Leaderboard
            </h3>
            <span className="text-xs text-slate-400">Round {question.index + 1}</span>
          </div>
          <PlayerList players={room.players} playerId={playerId} />
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Your score:</span>
          <span className="font-bold text-base text-violet-300">
            {room.players.find((p) => p.id === playerId)?.score || 0} pts
          </span>
        </div>
      </aside>
    </div>
  );
}

// -------------------------------------------------------------
// Screen 8: Final Results Screen
// -------------------------------------------------------------
function Results({ results, playerId, onHome }) {
  const winner = results.winner;
  const isYouWinner = winner && winner.name === results.rankings.find((p) => p.id === playerId)?.name;

  return (
    <div className="card mx-auto max-w-4xl p-6 sm:p-10 space-y-8">
      {/* Victory Celebration Header */}
      <div className="text-center relative">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 items-center justify-center text-amber-300 mb-3 shadow-glow">
          <Trophy size={32} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Match Completed</p>
        <h2 className="font-display text-3xl sm:text-5xl font-black text-white mt-1">
          {winner ? `${winner.name} Wins!` : 'Match Finished'}
        </h2>

        <p className="mt-2 text-sm text-slate-300">
          {results.topic} · {results.difficulty} · {results.source === 'ai' ? 'Google Gemini AI Questions' : 'Question Bank Fallback'}
        </p>

        {isYouWinner && (
          <div className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-amber-500/20 to-violet-500/20 border border-amber-500/40 px-5 py-2 text-sm font-bold text-amber-200">
            🏆 Congratulations! You took 1st place!
          </div>
        )}
      </div>

      {/* Podium Standings Table */}
      <div>
        <h3 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Award size={18} className="text-violet-400" />
          Final Arena Standings
        </h3>
        <div className="space-y-2">
          {results.rankings.map((player, index) => {
            const isYou = player.id === playerId;
            let medalColor = 'bg-slate-800 text-slate-400';
            if (index === 0) medalColor = 'bg-amber-500 text-slate-900 font-black';
            if (index === 1) medalColor = 'bg-slate-300 text-slate-900 font-bold';
            if (index === 2) medalColor = 'bg-amber-700 text-white font-bold';

            return (
              <div
                key={player.id || index}
                className={`flex items-center justify-between rounded-2xl p-4 transition-all ${
                  isYou
                    ? 'bg-violet-500/25 border border-violet-500/50 shadow-md'
                    : 'bg-black/30 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${medalColor}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{player.name}</span>
                      {isYou && (
                        <span className="rounded-md bg-violet-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {player.correctCount} correct answers
                    </div>
                  </div>
                </div>

                <div className="font-display text-lg font-extrabold text-slate-200">
                  {player.score} <span className="text-xs text-slate-400 font-normal">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Question Review */}
      <div>
        <h3 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-sky-400" />
          Question Review & Explanations ({results.questions.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {results.questions.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-100 text-sm sm:text-base">
                  {idx + 1}. {item.question}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                Correct Answer: {item.options[item.correctIndex]}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Return Button */}
      <div className="pt-4 text-center">
        <button className="btn-primary text-base px-8 py-3.5" onClick={onHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Screen 10: Match History Screen
// -------------------------------------------------------------
function HistoryPage({ data, onBack }) {
  return (
    <div className="card mx-auto max-w-3xl p-6 sm:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Saved Matches</p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Match History</h2>
        </div>
        <button type="button" onClick={onBack} className="btn-ghost text-sm px-3 py-1.5">
          <X size={18} /> Back
        </button>
      </div>

      {!data.enabled ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center space-y-3">
          <Globe size={32} className="mx-auto text-slate-500" />
          <h3 className="font-semibold text-slate-200">MongoDB Persistence Optional</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            MongoDB is currently not configured, so historical match archiving is disabled. Live multiplayer gameplay and AI quiz generation work normally without it.
          </p>
        </div>
      ) : data.matches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
          No saved matches found yet. Complete a quiz to view past match records.
        </div>
      ) : (
        <div className="space-y-3">
          {data.matches.map((match, index) => (
            <div key={`${match.roomCode}-${index}`} className="rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-white text-base">
                  {match.topic} · <span className="capitalize text-slate-400 text-sm font-normal">{match.difficulty}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Winner: <strong className="text-amber-300">{match.winner?.name || 'Draw'}</strong> ({match.winner?.score || 0} pts) · Room {match.roomCode}
                </div>
              </div>
              <div className="text-xs text-slate-500 sm:text-right">
                {new Date(match.finishedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <button className="btn-secondary w-full" onClick={onBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Application Component
// -------------------------------------------------------------
export default function App() {
  const [view, setView] = useState('home');
  const [connection, setConnection] = useState('connecting');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState(null);
  const [answerProgress, setAnswerProgress] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [history, setHistory] = useState({ enabled: false, matches: [] });
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [now, setNow] = useState(Date.now());

  // Check URL query parameters for invite links (e.g., ?room=ABC123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.length >= 6) {
      setInitialJoinCode(roomParam.toUpperCase());
      setView('join');
    }
  }, []);

  // Fetch server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch(() => {});
  }, []);

  // Synchronized clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO event registrations
  useEffect(() => {
    function onConnect() {
      setConnection('connected');
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) socket.emit('reconnectRoom', { token });
    }

    function onDisconnect() {
      setConnection('disconnected');
    }

    function onError(payload) {
      setBusy(false);
      setError(payload?.message || 'An unexpected error occurred.');
    }

    function remember(payload) {
      setPlayerId(payload.playerId);
      setRoom(payload.room);
      sessionStorage.setItem(TOKEN_KEY, payload.reconnectToken);
      setView('lobby');
      setBusy(false);
      setError('');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('errorMessage', onError);
    socket.on('roomCreated', remember);
    socket.on('joinedRoom', remember);

    socket.on('reconnected', (payload) => {
      remember(payload);
      if (payload.question) {
        setQuestion(payload.question);
        setView('quiz');
      }
      if (payload.room?.status === 'finished') setView('results');
    });

    socket.on('roomUpdated', (nextRoom) => setRoom(nextRoom));

    socket.on('leaderboard', (payload) => {
      setRoom((current) => (current ? { ...current, players: payload.players } : current));
    });

    socket.on('generatingQuestions', (payload) => {
      setBusy(true);
      setNotice(payload.message || 'Generating questions with Google Gemini...');
      setView('lobby');
    });

    socket.on('generationStatus', (payload) => {
      setNotice(payload.message);
    });

    socket.on('question', (nextQuestion) => {
      setBusy(false);
      setQuestion(nextQuestion);
      setSelected(null);
      setLocked(false);
      setResult(null);
      setAnswerProgress(null);
      setView('quiz');
    });

    socket.on('answerAccepted', () => {
      // Confirmed by server without leaking correctness prematurely
      setLocked(true);
    });

    socket.on('answerProgress', (payload) => {
      setAnswerProgress(payload);
    });

    socket.on('questionResult', (payload) => {
      setResult(payload);
      setLocked(true);
      setRoom((current) => (current ? { ...current, players: payload.players } : current));
    });

    socket.on('gameOver', (payload) => {
      setResults(payload);
      setView('results');
      sessionStorage.removeItem(TOKEN_KEY);
    });

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('errorMessage', onError);
      socket.removeAllListeners();
    };
  }, []);

  const seconds = useMemo(() => (question ? timeLeft(question.endsAt) : 0), [question, now]);

  async function openHistory() {
    try {
      const response = await fetch('/api/history');
      setHistory(await response.json());
      setView('history');
    } catch {
      setError('Could not load match history.');
    }
  }

  function resetToHome() {
    socket.emit('leaveRoom');
    sessionStorage.removeItem(TOKEN_KEY);
    setRoom(null);
    setQuestion(null);
    setResults(null);
    setResult(null);
    setSelected(null);
    setLocked(false);
    setNotice('');
    setError('');
    setView('home');
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:py-10 flex flex-col justify-between">
      <div>
        {/* Main Application Header */}
        <header className="mb-6 flex items-center justify-between">
          <button className="flex items-center gap-2.5 font-display text-xl font-black text-white hover:opacity-90 transition" onClick={resetToHome}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-sky-400 flex items-center justify-center text-white shadow-glow">
              <ClipboardList size={20} />
            </div>
            <span>Quiz Arena</span>
          </button>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              connection === 'connected' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {connection === 'connected' ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{connection === 'connected' ? 'Connected' : 'Reconnecting'}</span>
            </div>

            {room && (
              <button className="btn-ghost text-xs px-3 py-1.5 text-slate-400 hover:text-rose-300" onClick={resetToHome}>
                <LogOut size={14} /> Exit
              </button>
            )}
          </div>
        </header>

        {/* Global Notifications & Banner */}
        <div className="mb-6">
          <Banner
            connection={connection}
            error={error}
            notice={notice}
            onDismissError={() => setError('')}
            onDismissNotice={() => setNotice('')}
          />
        </div>

        {/* View Router */}
        {view === 'home' && (
          <Home
            serverStatus={serverStatus}
            onCreate={() => {
              setError('');
              setView('create');
            }}
            onJoin={() => {
              setError('');
              setView('join');
            }}
            onHistory={openHistory}
          />
        )}

        {view === 'create' && (
          <CreateForm
            busy={busy}
            onBack={() => setView('home')}
            onSubmit={(payload) => {
              setBusy(true);
              setError('');
              socket.emit('createRoom', payload);
            }}
          />
        )}

        {view === 'join' && (
          <JoinForm
            busy={busy}
            initialCode={initialJoinCode}
            onBack={() => setView('home')}
            onSubmit={(payload) => {
              setBusy(true);
              setError('');
              socket.emit('joinRoom', payload);
            }}
          />
        )}

        {view === 'lobby' && room && (
          <Lobby
            room={room}
            playerId={playerId}
            busy={busy}
            onStart={() => {
              setBusy(true);
              socket.emit('startGame');
            }}
            onLeave={resetToHome}
          />
        )}

        {view === 'quiz' && room && question && (
          <QuizScreen
            room={room}
            question={question}
            playerId={playerId}
            selected={selected}
            locked={locked}
            result={result}
            seconds={seconds}
            answerProgress={answerProgress}
            onAnswer={(index) => {
              setSelected(index);
              setLocked(true);
              socket.emit('submitAnswer', { optionIndex: index });
            }}
          />
        )}

        {view === 'results' && results && (
          <Results results={results} playerId={playerId} onHome={resetToHome} />
        )}

        {view === 'history' && (
          <HistoryPage data={history} onBack={() => setView('home')} />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>Quiz Arena · Developed by Aditya Sutar</p>
        <p className="mt-1">Linkedin - www.linkedin.com/in/aditya-sutar-7793902b5</p>
      </footer>
    </div>
  );
}
