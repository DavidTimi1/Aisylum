import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize lazily to ensure environment variables are loaded
let genAI;

function getGenAI() {
    if (!genAI) {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY is not defined in environment variables');
        }
        genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
    return genAI;
}

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

    return getGenAI().getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig,
    });
}

/**
 * Helper: run prompt with optional system instruction
 */
export async function runPrompt({ systemInstruction, userPrompt, history = [] }) {
    const model = getModel();
    const contents = [];

    for (const msg of history) {
        contents.push({
            role: msg.role,
            parts: [{ text: msg.content }],
        });
    }

    // Add the latest user message
    contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
    });

    const result = await model.generateContent({
        contents,
        systemInstruction: systemInstruction
            ? { role: 'system', parts: [{ text: systemInstruction }] }
            : undefined,
    });
    return result.response.text();
}
