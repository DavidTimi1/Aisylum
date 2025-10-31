
import { checkAIAvailability, type AI_APIS, type AIAvailability, type AICapabilities } from '@/lib/built-in-ai';
import { useState, useEffect, useCallback } from 'react';


/**
 * Hook to track availability and downloading state for AI APIs
 */
export function useAIAvailability(apiName: keyof typeof AI_APIS) {
  const [availability, setAvailability] = useState<AIAvailability>('no');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    checkAvailability();
  }, [apiName]);

  const checkAvailability = async () => {
    try {
        const result = await checkAIAvailability(apiName);

        if (result) {
          setAvailability(result.available);
        } else {
          setAvailability('no');
        }

    } catch (err) {
      setError(err as Error);
      setAvailability('no');
    }
  };

  return {
    availability,
    isAvailable: availability === 'readily',
    needsDownload: availability === 'after-download',
    isDownloading,
    downloadProgress,
    error,
    checkAvailability
  };
}


/**
 * Hook for managing AI sessions with automatic cleanup
 */
export function useAISession<T>(
    createSession: () => Promise<T>,
    dependencies: any[] = []
) {
    const [session, setSession] = useState<T | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const create = useCallback(async () => {
        setIsCreating(true);
        setError(null);
        try {
            const newSession = await createSession();
            setSession(newSession);
            return newSession;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, dependencies);

    const destroy = useCallback(() => {
        if (session && typeof (session as any).destroy === 'function') {
            (session as any).destroy();
        }
        setSession(null);
    }, [session]);

    useEffect(() => {
        return () => {
            destroy();
        };
    }, []);

    return { session, isCreating, error, create, destroy };
}