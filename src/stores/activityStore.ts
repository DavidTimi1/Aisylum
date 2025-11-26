import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for each activity section
interface ChatActivity {
    id: string;
    chatId: number;
    name: string;
    timestamp: number;
}

interface DocumentActivity {
    docId: number;
    docName: string;
    action: string;
    timestamp: number;
}

interface LanguageActivity {
    id: string;
    languageCode: string;
    module: number;
    timestamp: number;
}

// User preferences
interface UserPreferences {
    language: string;
    username: string;
}

// Store state
interface ActivityStore {
    // User info
    preferences: UserPreferences;

    // Activity arrays
    chatActivity: ChatActivity | null;
    documentActivity: DocumentActivity | null;
    languageActivity: LanguageActivity | null;

    // Actions for user preferences
    setUsername: (username: string) => void;
    setLanguage: (language: string) => void;

    // Actions for chat activities
    addChatActivity: (chatId: number, name: string) => void;
    removeChatActivity: (id: number) => void;

    // Actions for document activities
    addDocumentActivity: (docId: number, docName: string, action: string) => void;
    removeDocumentActivity: (id: number) => void;

    // Actions for language activities
    addLanguageActivity: (languageCode: string, module: number) => void;
    removeLanguageActivity: (id: number) => void;

    // Utility to get all recent activities sorted by timestamp
    getRecentActivities: (limit?: number) => {
        type: 'chat' | 'document' | 'language';
        data: ChatActivity | DocumentActivity | LanguageActivity;
    }[];

    allowedRemoteAIs: string[];
    addAllowedRemoteAI: (aiConfig: string[]) => void;
    checkAllowedRemoteAI: (aiConfig: string[]) => boolean;

    // Clear all activities
    clearAllActivities: () => void;
}

const useActivityStore = create<ActivityStore>()(
    persist(
        (set, get) => ({
            // Initial state
            preferences: {
                language: 'en',
                username: '',
            },
            chatActivity: null,
            documentActivity: null,
            languageActivity: null,

            allowedRemoteAIs: [],

            // User preference actions
            setUsername: (username) =>
                set((state) => ({
                    preferences: { ...state.preferences, username },
                })),

            setLanguage: (language) =>
                set((state) => ({
                    preferences: { ...state.preferences, language },
                })),

            // Chat activity actions
            addChatActivity: (chatId, name) =>
                set(() => {
                    // Add new activity
                    const newActivity: ChatActivity = {
                        id: `chat_${Date.now()}_${Math.random()}`,
                        chatId,
                        name,
                        timestamp: Date.now(),
                    };

                    return {
                        chatActivity: newActivity,
                    };
                }),

            removeChatActivity: () =>
                set(() => ({
                    chatActivity: null,
                })),

            // Document activity actions
            addDocumentActivity: (docId, docName, action) =>
                set(() => {
                    const newActivity: DocumentActivity = {
                        docId,
                        docName,
                        action,
                        timestamp: Date.now(),
                    };

                    return {
                        documentActivity: newActivity,
                    };
                }),

            removeDocumentActivity: (id) =>
                set(() => ({
                    documentActivity: null,
                })),

            // Language activity actions
            addLanguageActivity: (languageCode, module) =>
                set(() => {
                    const newActivity: LanguageActivity = {
                        id: `lang_${Date.now()}_${Math.random()}`,
                        languageCode,
                        module,
                        timestamp: Date.now(),
                    };

                    return {
                        languageActivity: newActivity,
                    };
                }),

            removeLanguageActivity: (id) =>
                set(() => ({
                    languageActivity: null,
                })),

            // Get all recent activities sorted
            getRecentActivities: (limit) => {
                const state = get();
                const { chatActivity, documentActivity, languageActivity } = state;
                const allActivities = [];

                if (chatActivity){
                    allActivities.push({ type: 'chat' as const, data: { ...chatActivity }})
                }
                if (documentActivity){
                    allActivities.push({ type: 'document' as const, data: { ...documentActivity }})
                }
                if (languageActivity){
                    allActivities.push({ type: 'language' as const, data: { ...languageActivity }})
                }

                // Sort by timestamp
                const recents = allActivities.filter( a => !!a.data).sort((a, b) => b.data.timestamp - a.data.timestamp);

                return limit ? recents.slice(0, limit) : recents;
            },

            // Clear all activities
            clearAllActivities: () =>
                set({
                    chatActivity: null,
                    documentActivity: null,
                    languageActivity: null,
                }),

            addAllowedRemoteAI: (aiConfig) => {
                const state = get();
                const stringedConfig = aiConfig.toString();
                if (state.allowedRemoteAIs.includes(stringedConfig))
                    return;

                set({
                    allowedRemoteAIs: [...state.allowedRemoteAIs, stringedConfig],
                });
            },

            checkAllowedRemoteAI: (aiConfig) => {
                const state = get();
                const stringedConfig = aiConfig.toString();
                return state.allowedRemoteAIs.includes(stringedConfig);
            }
        }),
        
        {
            name: 'activity-storage',
        }
    )
);

export default useActivityStore;