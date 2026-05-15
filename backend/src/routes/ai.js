'use strict';

const express = require('express');
const router = express.Router();
const { protect, requirePro } = require('../middleware/auth');
const { compile } = require('../compiler/index');
const { askAI, LOCAL_FALLBACKS } = require('../services/ai');

// POST /api/ai/explain  — explain the user's current code
router.post('/explain', protect, async (req, res) => {
  const { code, language = 'syless' } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'No code provided' });

  let pythonCode = '';
  if (language === 'syless') {
    const compiled = compile(code);
    pythonCode = compiled.success ? compiled.pythonCode : '';
  }

  const prompt = `Explain this SYLESS code step by step for a beginner:

\`\`\`syless
${code}
\`\`\`
${pythonCode ? `\nThis compiles to Python:\n\`\`\`python\n${pythonCode}\n\`\`\`` : ''}

Explain each line simply. What does the program do overall?`;

  try {
    const result = await askAI([{ role: 'user', content: prompt }], { model: 'fast', maxTokens: 800 });
    res.json({ success: true, explanation: result.text, provider: result.provider });
  } catch (err) {
    res.json({ success: true, explanation: LOCAL_FALLBACKS.explain(code), provider: 'local' });
  }
});

// POST /api/ai/debug  — help fix errors
router.post('/debug', protect, async (req, res) => {
  const { code, error, pythonCode } = req.body;
  if (!code || !error) {
    return res.status(400).json({ success: false, error: 'Code and error message required' });
  }

  const prompt = `A student got this error in their SYLESS code:

Error: "${error}"

Their code:
\`\`\`syless
${code}
\`\`\`
${pythonCode ? `Compiled Python:\n\`\`\`python\n${pythonCode}\n\`\`\`` : ''}

1. Explain what went wrong simply
2. Show the corrected SYLESS code
3. Explain why the fix works`;

  try {
    const result = await askAI([{ role: 'user', content: prompt }], { model: 'fast', maxTokens: 800 });
    res.json({ success: true, debug: result.text, provider: result.provider });
  } catch (err) {
    res.json({ success: true, debug: LOCAL_FALLBACKS.debug(error), provider: 'local' });
  }
});

// POST /api/ai/chat  — ARIA free conversation
router.post('/chat', protect, async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: 'Messages array required' });
  }

  // Inject current code context into the last user message if provided
  let chatMessages = messages.slice(-12);
  if (context && chatMessages.length > 0) {
    const last = chatMessages[chatMessages.length - 1];
    chatMessages[chatMessages.length - 1] = {
      ...last,
      content: last.content + `\n\n[Current code in editor:\n\`\`\`syless\n${context}\n\`\`\`]`,
    };
  }

  try {
    const result = await askAI(chatMessages, { model: 'powerful', maxTokens: 1500 });
    res.json({ success: true, reply: result.text, provider: result.provider });
  } catch (err) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    res.json({
      success: true,
      reply: LOCAL_FALLBACKS.chat(lastMsg),
      provider: 'local',
    });
  }
});

// POST /api/ai/autocomplete  — local suggestions (no AI needed)
router.post('/autocomplete', protect, async (req, res) => {
  const { prefix } = req.body;
  if (!prefix) return res.json({ success: true, suggestions: [] });
  res.json({ success: true, suggestions: getLocalSuggestions(prefix) });
});

// POST /api/ai/dsa-explain  — DSA concept explanation
router.post('/dsa-explain', protect, async (req, res) => {
  const { concept } = req.body;
  if (!concept) return res.status(400).json({ success: false, error: 'Concept required' });

  const prompt = `Explain the "${concept}" data structure to a complete beginner in under 250 words:
1. Simple real-world analogy
2. SYLESS code example
3. When to use it
Keep it encouraging and fun!`;

  try {
    const result = await askAI([{ role: 'user', content: prompt }], { model: 'fast', maxTokens: 600 });
    res.json({ success: true, explanation: result.text, provider: result.provider });
  } catch (err) {
    res.json({
      success: true,
      explanation: LOCAL_FALLBACKS.dsaExplain(concept),
      provider: 'local',
    });
  }
});

// POST /api/ai/fix  — Auto-fix code (Pro feature)
router.post('/fix', protect, requirePro, async (req, res) => {
  const { code, error } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Code required' });

  const prompt = `Fix this SYLESS code${error ? ` that has error: "${error}"` : ''}:

\`\`\`syless
${code}
\`\`\`

Return ONLY the corrected SYLESS code in a code block, then briefly explain what was wrong.`;

  try {
    const result = await askAI([{ role: 'user', content: prompt }], { model: 'powerful', maxTokens: 1000 });
    res.json({ success: true, fixedCode: result.text, provider: result.provider });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fix code — try adding a free Groq API key' });
  }
});

// POST /api/ai/interview  — AI mock interview (Pro feature)
router.post('/interview', protect, requirePro, async (req, res) => {
  const { topic, difficulty = 'easy', userAnswer } = req.body;

  const prompt = userAnswer
    ? `Student's answer: "${userAnswer}"\nEvaluate for a ${topic} interview question. Score 1-10, give feedback, show ideal SYLESS solution.`
    : `Give a ${difficulty} interview question about ${topic} solvable in SYLESS. Say what the interviewer wants to see.`;

  try {
    const result = await askAI([{ role: 'user', content: prompt }], { model: 'powerful', maxTokens: 1200 });
    res.json({ success: true, content: result.text, provider: result.provider });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not load interview question — add a free Groq API key' });
  }
});

// GET /api/ai/status  — check which AI providers are configured
router.get('/status', (req, res) => {
  const groqOk   = !!(process.env.GROQ_API_KEY   && !process.env.GROQ_API_KEY.startsWith('your_'));
  const geminiOk = !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_'));

  res.json({
    success: true,
    providers: {
      groq:   { configured: groqOk,   model: 'llama-3.1-8b-instant / llama3-70b-8192', cost: 'FREE' },
      gemini: { configured: geminiOk, model: 'gemini-1.5-flash',                       cost: 'FREE' },
      local:  { configured: true,     model: 'built-in fallback',                      cost: 'FREE' },
    },
    activeProvider: groqOk ? 'groq' : geminiOk ? 'gemini' : 'local',
  });
});

function getLocalSuggestions(prefix) {
  const snippets = [
    { trigger: 'say',     label: 'say -> "..."',             insert: 'say -> "${1:Hello}"' },
    { trigger: 'make',    label: 'make variable',             insert: 'make ${1:x} = ${2:value}' },
    { trigger: 'ask',     label: 'ask for input',             insert: 'ask ${1:name} -> "${2:Enter: }"' },
    { trigger: 'check',   label: 'check condition',           insert: 'check ${1:condition} {\n    ${2:say -> "yes"}\n}' },
    { trigger: 'loop',    label: 'loop N times',              insert: 'loop ${1:5} times {\n    ${2:say -> "Hello"}\n}' },
    { trigger: 'repeat',  label: 'repeat while',              insert: 'repeat while ${1:x < 10} {\n    ${2:say -> x}\n}' },
    { trigger: 'task',    label: 'task (function)',            insert: 'task ${1:myFunc}(${2:param}) {\n    ${3:give param}\n}' },
    { trigger: 'for',     label: 'for each loop',             insert: 'for each ${1:item} in ${2:items} {\n    ${3:say -> item}\n}' },
    { trigger: 'give',    label: 'give (return)',              insert: 'give ${1:value}' },
    { trigger: 'push',    label: 'push into stack',            insert: 'push ${1:value} into ${2:stack}' },
    { trigger: 'pop',     label: 'pop from stack',             insert: 'pop from ${1:stack}' },
    { trigger: 'sort',    label: 'sort array',                 insert: 'sort ${1:arr} ${2:ascending}' },
    { trigger: 'binary',  label: 'binary search',              insert: 'binary search ${1:target} in ${2:arr}' },
    { trigger: 'connect', label: 'connect graph nodes',        insert: 'connect ${1:A} to ${2:B}' },
  ];
  const lp = prefix.toLowerCase().trim();
  return snippets.filter(s => s.trigger.startsWith(lp) || s.label.toLowerCase().includes(lp)).slice(0, 6);
}

module.exports = router;
