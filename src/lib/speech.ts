// utils/speech.ts
export function speakText(text: string, lang = "en-US") {
    if (!("speechSynthesis" in window)) {
      return Promise.reject(new Error("TTS not supported"));
    }
    return new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.onend = () => resolve();
      speechSynthesis.cancel(); // clear any current
      speechSynthesis.speak(utter);
    });
  }
  
  type ListenResult = { transcript: string; confidence: number | null };
  
  export function listenOnce(lang = "en-US", timeout = 5000): Promise<ListenResult> {
    // Browser prefixes
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return Promise.reject(new Error("SpeechRecognition not supported"));
  
    return new Promise((resolve, reject) => {
      const rec = new SpeechRecognition();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      let timer = setTimeout(() => {
        try { rec.stop(); } catch (e) {}
        reject(new Error("timeout"));
      }, timeout);
  
      rec.onresult = (ev: any) => {
        clearTimeout(timer);
        const result = ev.results[0][0];
        resolve({ transcript: result.transcript, confidence: result.confidence ?? null });
      };
      rec.onerror = (e: any) => {
        clearTimeout(timer);
        reject(e.error || e);
      };
      rec.onend = () => { /* handled via result or error */ };
      rec.start();
    });
  }
  