import { Message } from '@/types/chat';
import { getAIResponse, AIResponse } from '@/utils/api';
import { generateMessageId } from '@/utils/messageUtils';
import { useCallback, useState } from 'react';

// Define character type for better type safety
interface Character {
    text: string;
    id: number;
}

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

const LONG_RESPONSES = [
    "The concept of artificial intelligence has evolved significantly over the decades. From early rule-based systems to modern deep learning approaches, AI has transformed how we interact with technology. Neural networks, inspired by the human brain, have enabled breakthroughs in image recognition, natural language processing, and decision-making systems.",

    "React Native has revolutionized mobile app development by allowing developers to build cross-platform applications using JavaScript. Unlike traditional approaches that required separate codebases for iOS and Android, React Native enables sharing of logic and UI components across platforms. The framework leverages native components under the hood, resulting in performance comparable to fully native apps.",

    "The history of computing spans centuries, from mechanical calculators to modern quantum computers. Charles Babbage's Analytical Engine in the 19th century laid the theoretical groundwork for programmable computers. The mid-20th century saw the development of ENIAC, one of the first general-purpose electronic computers. The invention of the transistor in 1947 led to smaller, more reliable computers."
];

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [normalIndex, setNormalIndex] = useState(0);
    const [mathIndex, setMathIndex] = useState(0);
    const [longIndex, setLongIndex] = useState(0);
    const [lastApiResponse, setLastApiResponse] = useState<AIResponse | null>(null);

    const simulateResponse = useCallback(async (userText: string) => {
        setIsStreaming(true);
        const responseId = generateMessageId();
        const isMathRequest = userText.toLowerCase().trim() === 'math';
        const isLongRequest = userText.toLowerCase().includes('long');

        // Get appropriate response based on request type
        let fullResponse: string;
        if (isMathRequest) {
            fullResponse = MATH_EXAMPLES[mathIndex];
        } else if (isLongRequest) {
            fullResponse = LONG_RESPONSES[longIndex];
        } else {
            fullResponse = NORMAL_RESPONSES[normalIndex];
        }

        // Add initial empty message
        setMessages(prev => [...prev, {
            id: responseId,
            text: '',
            isUser: false,
            isStreaming: true
        }]);

        // Determine streaming parameters based on text length
        const isShortMessage = fullResponse.length < 50;
        const baseDelay = isShortMessage ? 40 : isLongRequest ? 5 : 15;
        const batchSize = isShortMessage ? 1 : isLongRequest ? 15 : 5;

        // Stream characters with appropriate batch size and delay
        for (let i = 0; i < fullResponse.length; i += batchSize) {
            await new Promise(resolve => setTimeout(resolve, baseDelay));

            // Process a batch of characters
            const endIndex = Math.min(i + batchSize, fullResponse.length);
            const batchText = fullResponse.substring(i, endIndex);

            // Update message with new batch of text
            setMessages(prev =>
                prev.map(msg => {
                    if (msg.id === responseId) {
                        const newText = msg.text + batchText;
                        return {
                            ...msg,
                            text: newText
                        };
                    }
                    return msg;
                })
            );
        }

        // Update appropriate index
        if (isMathRequest) {
            setMathIndex((prev) => (prev + 1) % MATH_EXAMPLES.length);
        } else if (isLongRequest) {
            setLongIndex((prev) => (prev + 1) % LONG_RESPONSES.length);
        } else {
            setNormalIndex((prev) => (prev + 1) % NORMAL_RESPONSES.length);
        }

        // Mark message as complete
        setMessages(prev =>
            prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, isStreaming: false }
                    : msg
            )
        );

        setIsStreaming(false);
    }, [mathIndex, normalIndex, longIndex]);

    const addMessage = useCallback(async (text: string, isUser: boolean) => {
        // Add user message
        const newMessage: Message = {
            id: generateMessageId(),
            text: text.trim(),
            isUser,
            isStreaming: false
        };

        setMessages(prev => [...prev, newMessage]);

        // Get AI response when it's a user message
        if (isUser) {
            setIsStreaming(true);
            const responseId = generateMessageId();

            // Add initial empty message
            setMessages(prev => [...prev, {
                id: responseId,
                text: '',
                isUser: false,
                isStreaming: true
            }]);

            try {
                // Try to get AI response from API
                const response = await getAIResponse([...messages, newMessage]);
                
                // Store the full API response
                setLastApiResponse(response);
                
                // Get the content from the response
                const fullResponse = response.content;
                
                // Determine streaming parameters based on content length
                const isLongResponse = fullResponse.length > 100;
                const baseDelay = isLongResponse ? 5 : 15;
                const batchSize = isLongResponse ? 15 : 5;

                // Stream characters with appropriate batch size and delay
                for (let i = 0; i < fullResponse.length; i += batchSize) {
                    await new Promise(resolve => setTimeout(resolve, baseDelay));
                    
                    // Process a batch of characters
                    const endIndex = Math.min(i + batchSize, fullResponse.length);
                    const batchText = fullResponse.substring(i, endIndex);
                    
                    // Update message with new batch of text
                    setMessages(prev =>
                        prev.map(msg => {
                            if (msg.id === responseId) {
                                const newText = msg.text + batchText;
                                return {
                                    ...msg,
                                    text: newText
                                };
                            }
                            return msg;
                        })
                    );
                }
                
                // Mark message as complete
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === responseId
                            ? { ...msg, isStreaming: false }
                            : msg
                    )
                );
            } catch (error) {
                console.log('Falling back to simulated response');
                // If API fails, use simulated response
                await simulateResponse(text);
                // Remove the empty message we added
                setMessages(prev => prev.filter(msg => msg.id !== responseId));
            }

            setIsStreaming(false);
        }
    }, [messages, simulateResponse]);

    return {
        messages,
        isStreaming,
        addMessage,
        lastApiResponse
    };
};