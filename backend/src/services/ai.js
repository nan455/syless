'use strict';

/**
 * SYLESS Free AI Service
 *
 * Priority order:
 *   1. Groq  — llama-3.1-8b-instant / llama3-70b-8192  (FREE, 14,400 req/day)
 *   2. Gemini — gemini-1.5-flash                        (FREE, 1,500 req/day)
 *   3. Local fallback — pre-written helpful responses   (always free, no API needed)
 *
 * Sign up for free keys:
 *   Groq:   https://console.groq.com   (no credit card)
 *   Gemini: https://aistudio.google.com (no credit card)
 */

const axios = require('axios');

// ─── Model config ─────────────────────────────────────────────────────────────
const GROQ_MODELS = {
  fast:     'llama-3.1-8b-instant',     // fastest, good for explain/debug
  powerful: 'llama-3.3-70b-versatile',  // smarter, good for chat/interview
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

// ─── System prompt for SYLESS ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ARIA (AI Reasoning & Instruction Assistant), the built-in AI tutor for SYLESS — a beginner-friendly programming IDE where users write code in simple English-like sentences.

SYLESS Language Quick Reference:
- say -> "text"           → print text
- make x = 10             → variable declaration
- ask name -> "prompt"    → user input
- check x > 5 { }         → if statement
- otherwise { }           → else clause
- loop 5 times { }        → for loop (N times)
- repeat while cond { }   → while loop
- task name(param) { }    → function definition
- give value              → return value
- for each item in arr { } → for-each loop
- push val into stack      → stack push
- pop from stack           → stack pop
- sort arr ascending       → sort array
- binary search val in arr → binary search

Your personality: encouraging, patient, simple analogies, avoid jargon. Always explain WHY. Keep responses concise. When showing code, always use SYLESS syntax first, then Python equivalent.`;

// ─── Groq call ────────────────────────────────────────────────────────────────
async function callGroq(messages, model = GROQ_MODELS.fast, maxTokens = 1024) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.startsWith('your_')) throw new Error('GROQ_API_KEY not configured');

  const { data } = await axios.post(
    GROQ_URL,
    {
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return data.choices[0].message.content;
}

// ─── Gemini call ──────────────────────────────────────────────────────────────
async function callGemini(messages, maxTokens = 1024) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.startsWith('your_')) throw new Error('GEMINI_API_KEY not configured');

  // Combine system + user messages into Gemini format
  const combinedPrompt = SYSTEM_PROMPT + '\n\n' +
    messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

  const { data } = await axios.post(
    `${GEMINI_URL}?key=${key}`,
    {
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      ],
    },
    { timeout: 30000 }
  );
  return data.candidates[0].content.parts[0].text;
}

// ─── Local fallback responses ─────────────────────────────────────────────────
const LOCAL_FALLBACKS = {
  explain: (code) => `Here's a simple breakdown of your code:

\`\`\`syless
${code}
\`\`\`

**Step by step:**
- Each line runs from top to bottom
- \`say ->\` prints output to the screen
- \`make\` creates a new variable
- \`check\` tests a condition (like if/else)
- \`loop N times\` repeats a block N times

**Tip:** Try changing values and re-running to see what happens!

*(AI service not connected — add your free Groq key to .env for full AI explanations)*`,

  debug: (error) => `**Error detected:** ${error}

**Common fixes:**
- Missing closing \`}\` — check every \`{\` has a matching \`}\`
- Variable not defined — use \`make varName = value\` before using it
- Wrong syntax — check the SYLESS language reference

*(Add your free Groq key to .env for detailed AI debugging)*`,

  chat: (msg) => `I received your message: "${msg}"

I'm ARIA, your SYLESS AI tutor! To get full AI responses, add your **free Groq API key** to the \`.env\` file:

1. Go to https://console.groq.com (no credit card)
2. Create a free account
3. Generate an API key
4. Add to \`.env\`: \`GROQ_API_KEY=gsk_yourkey\`

In the meantime, here are quick SYLESS tips:
- Print: \`say -> "Hello"\`
- Variable: \`make x = 10\`
- If: \`check x > 5 { say -> "big" }\``,

  dsaExplain: (topic) => `**${topic.toUpperCase()}** — Quick Overview

A ${topic} is a way to organize data in memory.

**SYLESS example:**
\`\`\`syless
make ${topic.toLowerCase().replace(/\s/g, '')}
\`\`\`

**Real-world analogy:**
Think of a ${topic} like a stack of books — you add and remove from the same end!

*(Add your free Groq key to .env for detailed interactive explanations)*`,
};

// ─── Main AI function with fallback chain ─────────────────────────────────────
async function askAI(messages, options = {}) {
  const { model = 'fast', maxTokens = 1024 } = options;

  // 1. Try Groq
  try {
    const groqModel = model === 'powerful' ? GROQ_MODELS.powerful : GROQ_MODELS.fast;
    return { text: await callGroq(messages, groqModel, maxTokens), provider: 'groq' };
  } catch (groqErr) {
    const detail = groqErr.response?.data?.error?.message || groqErr.message;
    console.warn('[AI] Groq failed:', detail);
  }

  // 2. Try Gemini
  try {
    return { text: await callGemini(messages, maxTokens), provider: 'gemini' };
  } catch (gemErr) {
    const detail = gemErr.response?.data?.error?.message || gemErr.message;
    console.warn('[AI] Gemini failed:', detail);
  }

  // 3. Local fallback
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return {
    text: LOCAL_FALLBACKS.chat(lastUserMsg),
    provider: 'local',
    warning: 'AI service unavailable — add free Groq/Gemini key to .env',
  };
}

module.exports = { askAI, callGroq, callGemini, LOCAL_FALLBACKS, GROQ_MODELS };
