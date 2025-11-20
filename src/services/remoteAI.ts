
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const fetchAPI = (...args: any[]) => fetch(`${API_BASE_URL}${args[0]}`, ...args.slice(1));

export async function callRemotePromptAPI({ prompt, history, systemPrompt }: {
    prompt: string;
    history?: any[];
    systemPrompt?: string;
}) {
    const response = await fetchAPI('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, systemPrompt }),
    });

    if (!response.ok) {
        throw new Error('Remote LLM request failed');
    }

    const data = await response.json();
    return data.response;
}


export async function rewriteClearlyRemote(text: string, language: string): Promise<string> {
    try {
        const response = await fetchAPI('/api/rewriter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language }),
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`Remote rewrite failed: ${response.status} ${msg}`);
        }

        const data = await response.json();
        return data.response ?? text;
    } catch (error) {
        console.error('Remote rewrite error:', error);
        return text;
    }
}



export async function callRemoteSummarizeAPI(
    text: string,
    options: { type: string; length: string }
): Promise<string> {
    try {
        const response = await fetchAPI('/api/summarizer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, options }),
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`Remote summarization failed: ${response.status} ${msg}`);
        }

        const data = await response.json();
        return data.response ?? text;

    } catch (error) {
        console.error('Remote summarization error:', error);
        // Return original text to avoid breaking the UI
        return text;
    }
}


export async function callRemoteTranslateAPI(text: string, targetLanguage: string): Promise<string> {
    const response = await fetchAPI('/api/translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
        const msg = await response.text();
        console.error('Remote translation failed:', response.status, msg);
        return text; // fallback to original text
    }

    const data = await response.json();
    return data.response ?? text;
}
