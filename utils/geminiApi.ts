import { GoogleGenAI } from '@google/genai';
import { Message } from '@/types/chat';

// Create a separate interface file to avoid circular dependency
interface AIResponse {
    id: string;
    provider: string;
    model: string;
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getGeminiResponse = async (messages: Message[]): Promise<AIResponse> => {
    try {
        const lastMessage = messages[messages.length - 1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: lastMessage.text,
        });

        // Remove trailing newlines from the response text
        const cleanedContent = response?.text?.trim() ?? '';

        console.log('Gemini API Response:', JSON.stringify(response, null, 2));

        return {
            id: `gemini-${Date.now()}`,
            provider: 'google-gemini',
            model: 'gemini-2.0-flash-001',
            content: cleanedContent,
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};