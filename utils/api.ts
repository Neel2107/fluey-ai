import { Message } from '@/types/chat';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const SITE_URL = 'https://fluey-ai.vercel.app';
const SITE_NAME = 'Fluey AI';

export interface AIResponse {
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

export const getAIResponse = async (messages: Message[]): Promise<AIResponse> => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "featherless/qwerky-72b:free",
                messages: messages.map(msg => ({
                    role: msg.isUser ? "user" : "assistant",
                    content: msg.text
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Log the full response data for debugging
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        // Return structured response data
        return {
            id: data.id,
            provider: data.provider,
            model: data.model,
            content: data.choices[0].message.content,
            usage: data.usage
        };
    } catch (error) {
        console.error('Error getting AI response:', error);
        throw error; // Re-throw to allow fallback in useChat
    }
};