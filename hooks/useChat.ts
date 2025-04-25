import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';
import { useCallback, useState } from 'react';

const NORMAL_RESPONSES = [
    "I'm here to help! What would you like to know?",
    "That's an interesting point. Could you tell me more?",
    "I understand what you're saying. Let me help you with that.",
    "Thanks for sharing. Is there anything specific you'd like to explore?",
    "I'm processing your message. What aspects would you like me to focus on?"
];

const MATH_EXAMPLES = [
    "$E = mc^2$ - Einstein's famous equation",
    "The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
    "$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$ - A 2x2 matrix",
    "The integral: $$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$",
    "$e^{i\\pi} + 1 = 0$ - Euler's identity"
];

export const useChat = (initialMessage?: string) => {
    const [messages, setMessages] = useState<Message[]>(
        initialMessage ? [{ id: generateMessageId(), text: initialMessage, isUser: true }] : []
    );
    const [isStreaming, setIsStreaming] = useState(false);
    const [normalIndex, setNormalIndex] = useState(0);
    const [mathIndex, setMathIndex] = useState(0);

    const simulateResponse = useCallback(async (userText: string) => {
        setIsStreaming(true);
        const responseId = generateMessageId();
        const isMathRequest = userText.toLowerCase().trim() === 'math';

        // Get appropriate response
        const fullResponse = isMathRequest
            ? MATH_EXAMPLES[mathIndex]
            : NORMAL_RESPONSES[normalIndex];

        // Add initial empty message with empty characters array
        setMessages(prev => [...prev, {
            id: responseId,
            text: '',
            isUser: false,
            isStreaming: true,
            characters: []
        }]);

        // Stream each character with a small delay
        for (let i = 0; i < fullResponse.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 30));
            
            // Add new character to the characters array
            setMessages(prev => 
                prev.map(msg => {
                    if (msg.id === responseId) {
                        const updatedChars = [...(msg.characters || []), { 
                            text: fullResponse[i], 
                            id: i 
                        }];
                        
                        return {
                            ...msg,
                            characters: updatedChars,
                            text: updatedChars.map(c => c.text).join('')
                        };
                    }
                    return msg;
                })
            );
        }

        // Update appropriate index
        if (isMathRequest) {
            setMathIndex((prev) => (prev + 1) % MATH_EXAMPLES.length);
        } else {
            setNormalIndex((prev) => (prev + 1) % NORMAL_RESPONSES.length);
        }

        // Mark message as complete after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        setMessages(prev =>
            prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, isStreaming: false }
                    : msg
            )
        );

        setIsStreaming(false);
    }, [mathIndex, normalIndex]);

    const addMessage = useCallback(async (text: string, isUser: boolean) => {
        // Add user message
        setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: text.trim(),
            isUser
        }]);

        // Simulate AI response when it's a user message
        if (isUser) {
            await simulateResponse(text);
        }
    }, [simulateResponse]);

    return {
        messages,
        isStreaming,
        addMessage,
    };
};