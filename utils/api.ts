import { Message } from '@/types/chat';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const SITE_URL = 'https://fluey-ai.vercel.app';
const SITE_NAME = 'Fluey AI';

// Fallback responses for when API is not available
const FALLBACK_RESPONSES = [
    "I'm here to help! What would you like to know?",
    "That's an interesting question. Let me think about that...",
    "I understand what you're saying. Here's what I think about it...",
    "Thanks for sharing. Based on what you've told me, I would suggest...",
    "I've analyzed your message and here's my response...",
];

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
};

// Function to generate a fallback response
const generateFallbackResponse = (messages: Message[]): AIResponse => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    let responseIndex = 0;
    
    // Use the last character of the message as a simple hash to select a response
    if (lastUserMessage && lastUserMessage.text.length > 0) {
        const charCode = lastUserMessage.text.charCodeAt(lastUserMessage.text.length - 1);
        responseIndex = charCode % FALLBACK_RESPONSES.length;
    }
    
    const content = FALLBACK_RESPONSES[responseIndex];
    const messageLength = messages.reduce((sum, msg) => sum + msg.text.length, 0);
    
    return {
        id: `fallback-${Date.now()}`,
        provider: "local-fallback",
        model: "fallback-model",
        content,
        usage: {
            prompt_tokens: Math.ceil(messageLength / 4),
            completion_tokens: Math.ceil(content.length / 4),
            total_tokens: Math.ceil((messageLength + content.length) / 4)
        }
    };
};

export const getAIResponse = async (messages: Message[]): Promise<AIResponse> => {
    try {
        console.log('==== API REQUEST STARTED ====');
        console.log('Sending request to OpenRouter API with messages:', messages.length);
        console.log('Last message:', messages.length > 0 ? messages[messages.length-1].text.substring(0, 50) : 'No messages');
        
        // Check if API key is configured
        if (!OPENROUTER_API_KEY) {
            console.log('OpenRouter API key is not configured. Using fallback response mechanism.');
            const fallbackResponse = generateFallbackResponse(messages);
            console.log('Generated fallback response:', fallbackResponse.content.substring(0, 50));
            return fallbackResponse;
        }

        console.log('Preparing API request with key:', OPENROUTER_API_KEY ? '(Key exists)' : '(No key)');
        const requestBody = {
            "model": "featherless/qwerky-72b:free",
            messages: messages.map(msg => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.text
            }))
        };
        console.log('Request body prepared:', JSON.stringify(requestBody).substring(0, 100) + '...');

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed with status ${response.status}:`, errorText);
            console.log('Falling back to local response generation');
            const fallbackResponse = generateFallbackResponse(messages);
            console.log('Generated fallback response after error:', fallbackResponse.content.substring(0, 50));
            return fallbackResponse;
        }

        const data = await response.json();
        
        // Log the full response data for debugging
        console.log('API Response received successfully');
        console.log('Response ID:', data.id);
        console.log('Provider:', data.provider);
        console.log('Model:', data.model);
        console.log('Content:', data.choices[0].message.content.substring(0, 50) + '...');
        console.log('Usage:', data.usage);
        
        // Return structured response data
        const result = {
            id: data.id,
            provider: data.provider,
            model: data.model,
            content: data.choices[0].message.content,
            usage: data.usage
        };
        
        console.log('==== API REQUEST COMPLETED ====');
        return result;
    } catch (error) {
        console.error('==== API ERROR ====');
        console.error('Error getting AI response:', error);
        console.log('Falling back to local response generation due to error');
        const fallbackResponse = generateFallbackResponse(messages);
        console.log('Generated fallback response after exception:', fallbackResponse.content.substring(0, 50));
        return fallbackResponse;
    }
};