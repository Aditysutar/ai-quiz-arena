import { config, FALLBACK_MODELS } from './config.js';
import { pickFallbackQuestions, sanitizeQuestions } from './questionBank.js';

function buildPrompt({ topic, difficulty, count }) {
  return `Create exactly ${count} original, high-quality multiple-choice quiz questions about "${topic}".
Difficulty level: ${difficulty}. If "mixed", provide a balanced mix of easy, medium, and hard questions.
Rules:
- Each question must have exactly 4 distinct, plausible options.
- Exactly one option must be the correct answer.
- "correctIndex" must be a 0-based integer (0, 1, 2, or 3) indicating which option is correct.
- Include a concise 1-2 sentence explanation clarifying why that option is correct.
- Do not repeat questions or options.
- Questions must be clear, engaging, and suitable for a general audience.
Return ONLY valid JSON matching this exact structure:
{"questions":[{"question":"Question text?","options":["Option A","Option B","Option C","Option D"],"correctIndex":0,"explanation":"Explanation of the answer."}]}`;
}

function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
}

function parseQuestions(text) {
  const trimmed = String(text || '').trim();
  const jsonMatch = trimmed.match(/(?:\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) return [];
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.questions)) return parsed.questions;
    return [];
  } catch {
    return [];
  }
}

async function requestModel(model, prompt, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.generationTimeoutMs);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body?.error?.message || `Gemini HTTP ${response.status}`;
      throw new Error(message);
    }
    return parseQuestions(extractText(body));
  } finally {
    clearTimeout(timer);
  }
}

export async function generateQuestions({ topic, difficulty, count }) {
  const fallback = () => ({
    source: 'fallback',
    questions: pickFallbackQuestions({ topic, difficulty, count }),
    message: 'Built-in question bank is being used because AI generation was unavailable.'
  });

  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || process.env.NODE_ENV === 'test') {
    return {
      ...fallback(),
      message: apiKey
        ? 'Test mode is using the built-in question bank.'
        : 'Gemini API key is not configured. Built-in questions are being used.'
    };
  }

  const prompt = buildPrompt({ topic, difficulty, count });
  const errors = [];

  for (const model of FALLBACK_MODELS) {
    try {
      const raw = await requestModel(model, prompt, apiKey);
      const questions = sanitizeQuestions(raw, count);
      if (questions.length === count) {
        return {
          source: 'ai',
          model,
          questions,
          message: `Questions generated with Google Gemini (${model}).`
        };
      }
      errors.push(`${model}: expected ${count} valid questions, received ${questions.length}`);
    } catch (error) {
      errors.push(`${model}: ${error.message}`);
    }
  }

  return {
    ...fallback(),
    message: `AI generation unavailable (${errors[0] || 'service busy'}). Switched to verified question bank.`
  };
}
