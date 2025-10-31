
export type AIAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface AICapabilities {
    available: AIAvailability;
    defaultTopK?: number;
    maxTopK?: number;
    defaultTemperature?: number;
}

interface DownloadProgressEvent {
    loaded: number;
    total: number;
}

export interface AISession {
    prompt(input: string): Promise<string>;
    promptStreaming(input: string): ReadableStream;
    destroy(): void;
}


export enum AI_APIS {
    PROMPT = 'LanguageModel',
    SUMMARIZER = 'Summarizer',
    WRITER = 'Writer',
    REWRITER = 'Rewriter',
    TRANSLATOR = 'Translator',
    LANGUAGE_DETECTOR = 'LanguageDetector',
    PROOFREADER = 'Proofreader'
}



export const checkAIAvailability = async (apiName: string) => {
    const isSupported = apiName in window;
    const availability = isSupported ? await window[apiName].availability() : 'unavailable';

    return availability as AIAvailability;
};

/**
 * Convert streaming chunks to incremental updates
 * (Chrome's current implementation returns cumulative text)
 */
export async function* streamToIncrementalChunks(
    stream: ReadableStream
): AsyncGenerator<string> {
    const reader = stream.getReader();
    let previousText = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const currentText = value;
            const newContent = currentText.slice(previousText.length);
            previousText = currentText;

            if (newContent) {
                yield newContent;
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Monitor download progress
 */
export function createDownloadMonitor(
    onProgress: (loaded: number, total: number) => void
) {
    return (m: any) => {
        m.addEventListener('downloadprogress', (e: DownloadProgressEvent) => {
            onProgress(e.loaded, e.total);
        });
    };
}



export interface PromptOptions {
    systemPrompt?: string;
    history: Array<{ role: string; content: string }>;
}

/**
 * Create a chat session with Prompt API
 */
export async function createChatSession(
    options: PromptOptions
): Promise<AISession> {
    const isAvailable = await checkAIAvailability(AI_APIS.PROMPT) === 'available';
    const LanguageModel = (window as any).LanguageModel;

    if (!isAvailable) {
        throw new Error('Prompt API not available');
    }
    
    const params = await LanguageModel.params();

    return await LanguageModel.create({
        temperature: Math.max(params.defaultTemperature * 1.2, 2.0),
        topK: params.defaultTopK,

        initialPrompts: [
            ...(options.systemPrompt
                ? [{ role: 'system', content: options.systemPrompt }]
                : []),
            ...options.history
        ],
        
    });
}

/**
 * Send a message and get streaming response
 */
export async function* streamAIResponse(
    session: AISession,
    message: string
): AsyncGenerator<string> {
    const stream = session.promptStreaming(message);
    yield* streamToIncrementalChunks(stream);
}


// =============================================================================
// SUMMARIZER API
// =============================================================================

export interface SummarizerOptions {
    type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
    format?: 'plain-text' | 'markdown';
    length?: 'short' | 'medium' | 'long';
}

interface AISummarizer {
    summarize(text: string, options?: SummarizerOptions): Promise<string>;
    summarizeStreaming(text: string, options?: SummarizerOptions): ReadableStream;
    destroy(): void;
}

/**
 * Create summarizer
 */
export async function createSummarizer(
    options: SummarizerOptions = {},
    // onDownloadProgress?: (progress: number) => void
) {
    const isAvailable = await checkAIAvailability(AI_APIS.SUMMARIZER) === 'available';
    const Summarizer = (window as any).Summarizer;

    if (!isAvailable) {
        throw new Error('Summarizer API not available');
    }

    const summarizerOptions: any = {
        type: options.type || 'tl;dr',
        format: options.format || 'plain-text',
        length: options.length || 'medium',
    };

    // if (onDownloadProgress) {
    //     summarizerOptions.monitor = createDownloadMonitor((loaded, total) => {
    //         onDownloadProgress(loaded / total);
    //     });
    // }

    const summarizer = await Summarizer.create(summarizerOptions);
    return summarizer as AISummarizer;
}

/**
 * Generate a title from conversation
 */
export async function generateConversationTitle(
    messages: Array<{ role: string; content: string }>
): Promise<string> {
    const conversationText = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

    const titleSummarzer = await createSummarizer({
        type: 'headline',
        length: 'short'
    });

    return await titleSummarzer.summarize(conversationText, {
        type: 'headline',
        length: 'short'
    });
}


// =============================================================================
// LANGUAGE DETECTOR API
// =============================================================================

interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
}


/**
 * Detect language from text
 */
interface LanguageDetectorSession {
    detect(text: string): Promise<LanguageDetectionResult[]>;
    destroy(): void;
}

let languageDetectorInstance: LanguageDetectorSession;

export async function detectLanguage(
    text: string,
    topResults: number = 3
) {
    const isAvailable = await checkAIAvailability(AI_APIS.LANGUAGE_DETECTOR) === 'available';
    const LanguageDetector = (window as any).LanguageDetector;

    if (!isAvailable) {
        throw new Error('LanguageDetector API not available');
    }

    if (!languageDetectorInstance) {
        languageDetectorInstance = await LanguageDetector.create();
    }
    const results = await languageDetectorInstance.detect(text) as LanguageDetectionResult[];
    return results.slice(0, topResults);
}

/**
 * Get primary detected language
 */
export async function getPrimaryLanguage(text: string){
    const results = await detectLanguage(text, 1);
    return results[0]?.detectedLanguage;
}


// =============================================================================
// TRANSLATOR API
// =============================================================================

interface TranslatorSession {
    translate(text: string): Promise<string>;
    translateStreaming(text: string): ReadableStream;
    destroy(): void;
}

export interface TranslatorOptions {
    sourceLanguage: string;
    targetLanguage: string;
}

/**
 * Translate text
 */

const TranslatorCache: { [key: string]: TranslatorSession } = {};

export async function translateText(
    text: string,
    options: TranslatorOptions,
    onDownloadProgress?: (progress: number) => void
): Promise<string> {
    if (!(AI_APIS.TRANSLATOR in window)) {
        throw new Error('Translator API not supported');
    }
    const Translator = (window as any)[AI_APIS.TRANSLATOR];

    const translatorOptions: any = {
        sourceLanguage: options.sourceLanguage,
        targetLanguage: options.targetLanguage,
    };
    const keyValue = `${options.sourceLanguage}-${options.targetLanguage}`;

    if (onDownloadProgress) {
        translatorOptions.monitor = createDownloadMonitor((loaded, total) => {
            onDownloadProgress(loaded / total);
        });
    }

    if (keyValue in TranslatorCache) {
        onDownloadProgress && onDownloadProgress(1);

    } else {
        const buffer = await Translator.create(translatorOptions);
        TranslatorCache[keyValue] = buffer;
    }
    const translator = TranslatorCache[keyValue];
    const result = await translator.translate(text);
    return result;
}

/**
 * Auto-detect language and translate
 */
export async function autoTranslate(
    text: string,
    targetLanguage: string
): Promise<string> {
    const sourceLanguage = await getPrimaryLanguage(text);
    return await translateText(text, { sourceLanguage, targetLanguage });
}


// =============================================================================
// WRITER API
// =============================================================================

export interface WriterOptions {
    tone?: 'formal' | 'neutral' | 'casual';
    format?: 'markdown' | 'plain-text';
    length?: 'short' | 'medium' | 'long';
    sharedContext?: string;
}

/**
 * Generate new content
 */
export async function writeContent(
    prompt: string,
    options: WriterOptions = {},
    onDownloadProgress?: (progress: number) => void
): Promise<string> {
    if (!('Writer' in window)) {
        throw new Error('Writer API not supported');
    }

    const writerOptions: any = {
        tone: options.tone || 'neutral',
        format: options.format || 'plain-text',
        length: options.length || 'medium',
    };

    if (options.sharedContext) {
        writerOptions.sharedContext = options.sharedContext;
    }

    if (onDownloadProgress) {
        writerOptions.monitor = createDownloadMonitor((loaded, total) => {
            onDownloadProgress(loaded / total);
        });
    }

    const writer = await (window as any).Writer.create(writerOptions);
    const result = await writer.write(prompt);
    writer.destroy();
    return result;
}

// =============================================================================
// REWRITER API
// =============================================================================

export interface RewriterOptions {
    tone?: 'as-is' | 'more-formal' | 'more-casual';
    format?: 'as-is' | 'plain-text' | 'markdown';
    length?: 'as-is' | 'shorter' | 'longer';
    context?: string;
}

/**
 * Rewrite existing text
 */
export async function rewriteText(
    text: string,
    options: RewriterOptions = {},
    onDownloadProgress?: (progress: number) => void
): Promise<string> {
    if (!('Rewriter' in window)) {
        throw new Error('Rewriter API not supported');
    }

    const rewriterOptions: any = {
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is',
    };

    if (options.context) {
        rewriterOptions.context = options.context;
    }

    if (onDownloadProgress) {
        rewriterOptions.monitor = createDownloadMonitor((loaded, total) => {
            onDownloadProgress(loaded / total);
        });
    }

    const rewriter = await (window as any).Rewriter.create(rewriterOptions);
    const result = await rewriter.rewrite(text);
    rewriter.destroy();
    return result;
}

// =============================================================================
// PROOFREADER API
// =============================================================================

export interface ProofreadingResult {
    corrections: Array<{
        original: string;
        correction: string;
        start: number;
        end: number;
        explanation?: string;
    }>;
}

/**
 * Proofread text
 */
export async function proofreadText(
    text: string,
    expectedLanguages: string[] = ['en'],
    onDownloadProgress?: (progress: number) => void
): Promise<ProofreadingResult> {
    if (!('Proofreader' in window)) {
        throw new Error('Proofreader API not supported');
    }

    const proofreaderOptions: any = {
        expectedInputLanguages: expectedLanguages,
    };

    if (onDownloadProgress) {
        proofreaderOptions.monitor = createDownloadMonitor((loaded, total) => {
            onDownloadProgress(loaded / total);
        });
    }

    const proofreader = await (window as any).Proofreader.create(proofreaderOptions);
    const result = await proofreader.proofread(text);
    proofreader.destroy();
    return result;
}



// =============================================================================
// EXAMPLE USAGE PATTERNS
// =============================================================================

/**
 * Example: Complete chat implementation
 */
export async function exampleChatImplementation() {
    // Create session
    const session = await createChatSession({
        systemPrompt: 'You are a helpful assistant.',
        temperature: 0.8
    });

    // Send message
    const response = await sendMessage(session, 'Hello!');
    console.log(response);

    // Send with streaming
    for await (const chunk of sendMessageStreaming(session, 'Tell me a story')) {
        console.log(chunk); // Process each chunk as it arrives
    }

    // Cleanup
    session.destroy();
}

/**
 * Example: React component with hooks
 */
/*
function ChatComponent() {
  const { isAvailable, needsDownload } = useAIAvailability('prompt');
  const { session, create, destroy } = useAISession(
    () => createChatSession({ systemPrompt: 'You are helpful.' })
  );

  useEffect(() => {
    if (isAvailable && !session) {
      create();
    }
  }, [isAvailable]);

  const handleSend = async (message: string) => {
    if (!session) return;
    
    for await (const chunk of sendMessageStreaming(session, message)) {
      // Update UI with chunk
    }
  };

  return (
    <div>
      {needsDownload && <p>Model needs to be downloaded</p>}
      {isAvailable && <button onClick={() => handleSend('Hi!')}>Send</button>}
    </div>
  );
}
*/