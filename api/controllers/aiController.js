import { runPrompt } from '../services/geminiService.js';

export const prompt = async (req, res, next) => {
    try {
        const { systemPrompt, prompt, history } = req.body;
        const response = await runPrompt({
            systemInstruction: systemPrompt + " keep responses a bit brief and without any markdown or styles unless explicitly asked for",
            userPrompt: prompt,
            history
        });
        res.json({ response });
    } catch (error) {
        next(error);
    }
};

export const summarizer = async (req, res, next) => {
    try {
        const { text, options = {} } = req.body;
        const { type = 'tl;dr', format = 'plain-text', length = 'medium' } = options;

        let instruction = "Don't use markdown unless i later say so \n";
        if (type === 'key-points') instruction += 'Extract the key points from the text.';
        else if (type === 'tl;dr') instruction += 'Provide a TL;DR summary.';
        else if (type === 'teaser') instruction += 'Create an engaging teaser.';
        else if (type === 'headline') instruction += 'Generate a headline.';

        if (length === 'short') instruction += ' Keep it very brief.';
        if (length === 'long') instruction += ' Provide a comprehensive summary.';
        if (format === 'markdown') instruction += ' Format using markdown.';

        const response = await runPrompt({
            systemInstruction: instruction,
            userPrompt: text,
        });

        res.json({ response });
    } catch (error) {
        next(error);
    }
};

export const writer = async (req, res, next) => {
    try {
        const { prompt, options = {} } = req.body;
        const { tone = 'neutral', format = 'plain-text', length = 'medium', sharedContext } = options;

        let systemInstruction = `Write with a ${tone} tone, don't use markdown unless i later say so \n`;
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
        next(error);
    }
};

export const rewriter = async (req, res, next) => {
    try {
        const { text, options = {} } = req.body;
        const { tone = 'as-is', format = 'as-is', length = 'as-is', sharedContext, language } = options;

        let systemInstruction = 'Rewrite the text';

        if (tone !== 'as-is') systemInstruction += ` in a ${tone.replace('more-', '')} tone`;
        if (length === 'shorter') systemInstruction += ', making it more concise';
        if (length === 'longer') systemInstruction += ', expanding it with more detail';
        if (format === 'markdown') systemInstruction += ', formatted in markdown';
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
        next(error);
    }
};

export const translator = async (req, res, next) => {
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;

        const systemInstruction = `Translate from ${sourceLanguage} to ${targetLanguage}. Respond only with the translation.`;

        const response = await runPrompt({
            systemInstruction,
            userPrompt: text,
        });

        res.json({ response });
    } catch (error) {
        next(error);
    }
};

export const languageDetector = async (req, res, next) => {
    try {
        const { text } = req.body;
        const systemInstruction = 'Detect the language and reply with only the language name.';
        const response = await runPrompt({
            systemInstruction,
            userPrompt: text,
        });

        res.json({ language: response.trim() });
    } catch (error) {
        next(error);
    }
};

export const proofreader = async (req, res, next) => {
    try {
        const { text } = req.body;
        const systemInstruction = 'Proofread grammar, spelling, and punctuation errors. Return only the corrected text.';
        const response = await runPrompt({
            systemInstruction,
            userPrompt: text,
        });
        res.json({ response });
    } catch (error) {
        next(error);
    }
};
