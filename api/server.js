import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const app = express();

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Helper: get a configured Gemini model instance
 */
function getModel({ responseSchema } = {}) {
  const generationConfig = {
    temperature: 0.7,
  };

  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = responseSchema;
  }

  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig,
  });
}

/**
 * Helper: run prompt with optional system instruction
 */
async function runPrompt({ systemInstruction, userPrompt }) {
  const model = getModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: systemInstruction
      ? { role: 'system', parts: [{ text: systemInstruction }] }
      : undefined,
  });
  return result.response.text();
}

/* ==============================
   Routes
   ============================== */

// Generic Prompt API
app.post('/api/prompt', async (req, res) => {
  try {
    const { systemPrompt, prompt } = req.body;
    const response = await runPrompt({
      systemInstruction: systemPrompt + " keep responses short and without any markdown or styles unless explicitly asked for",
      userPrompt: prompt,
    });
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Summarizer
app.post('/api/summarizer', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    const { type = 'tl;dr', format = 'plain-text', length = 'medium' } = options;

    let instruction = '';
    if (type === 'key-points') instruction = 'Extract the key points from the text.';
    else if (type === 'tl;dr') instruction = 'Provide a TL;DR summary.';
    else if (type === 'teaser') instruction = 'Create an engaging teaser.';
    else if (type === 'headline') instruction = 'Generate a headline.';

    if (length === 'short') instruction += ' Keep it very brief.';
    if (length === 'long') instruction += ' Provide a comprehensive summary.';
    if (format === 'markdown') instruction += ' Format using markdown.';

    const response = await runPrompt({
      systemInstruction: instruction,
      userPrompt: text,
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Writer
app.post('/api/writer', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    const { tone = 'neutral', format = 'plain-text', length = 'medium', sharedContext } = options;

    let systemInstruction = `Write with a ${tone} tone.`;
    if (length === 'short') systemInstruction += ' Keep it concise.';
    if (length === 'long') systemInstruction += ' Write in detail.';
    if (format === 'markdown') systemInstruction += ' Format in markdown.';
    if (sharedContext) systemInstruction += ` Context: ${sharedContext}.`;

    const response = await runPrompt({
      systemInstruction,
      userPrompt: prompt,
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rewriter
app.post('/api/rewriter', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    const { tone = 'as-is', format = 'as-is', length = 'as-is', sharedContext, language } = options;

    let systemInstruction = 'Rewrite the text';

    if (tone !== 'as-is') systemInstruction += ` in a ${tone.replace('more-', '')} tone`;
    if (length === 'shorter') systemInstruction += ', making it more concise';
    if (length === 'longer') systemInstruction += ', expanding it with more detail';
    if (format === 'markdown' && format !== 'as-is') systemInstruction += ', formatted in markdown';
    else if (format === 'plain-text') systemInstruction += ', as plain text';
    if (language) systemInstruction += ` in ${language}`;
    if (sharedContext) systemInstruction += `. Context: ${sharedContext}`;
    systemInstruction += '.';

    const response = await runPrompt({
      systemInstruction,
      userPrompt: text,
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translator
app.post('/api/translator', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    const systemInstruction = `Translate from ${sourceLanguage} to ${targetLanguage}. Respond only with the translation.`;

    const response = await runPrompt({
      systemInstruction,
      userPrompt: text,
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Language Detector
app.post('/api/language-detector', async (req, res) => {
  try {
    const { text } = req.body;
    const systemInstruction = 'Detect the language and reply with only the language name.';
    const response = await runPrompt({
      systemInstruction,
      userPrompt: text,
    });

    res.json({ language: response.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proofreader
app.post('/api/proofreader', async (req, res) => {
  try {
    const { text } = req.body;
    const systemInstruction = 'Proofread grammar, spelling, and punctuation errors. Return only the corrected text.';
    const response = await runPrompt({
      systemInstruction,
      userPrompt: text,
    });
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// for Vercel
export default app;

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });