import { Message } from '@/types/chat';
import { getAIResponse, AIResponse } from '@/utils/api';
import { generateMessageId } from '@/utils/messageUtils';
import { loadMessages, saveMessages } from '@/utils/storage';
import { useCallback, useState, useEffect } from 'react';

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

export const useChat = (initialMessages: Message[] = []) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isStreaming, setIsStreaming] = useState(false);
    const [normalIndex, setNormalIndex] = useState(0);
    const [mathIndex, setMathIndex] = useState(0);
    const [longIndex, setLongIndex] = useState(0);
    const [lastApiResponse, setLastApiResponse] = useState<AIResponse | null>(null);
    const [useApiResponse, setUseApiResponse] = useState(true);

    // Load messages from AsyncStorage on initial render if no initialMessages provided
    useEffect(() => {
        if (initialMessages.length === 0) {
            const loadSavedMessages = async () => {
                const savedMessages = await loadMessages();
                if (savedMessages.length > 0) {
                    setMessages(savedMessages);
                }
            };
            
            loadSavedMessages();
        } else {
            // Update messages when initialMessages changes (e.g., when switching chats)
            console.log('Updating messages from initialMessages:', initialMessages.length);
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    // Save messages to AsyncStorage whenever they change
    useEffect(() => {
        if (messages.length > 0 && initialMessages.length === 0) {
            // Only save to AsyncStorage if we're not using initialMessages (session-based)
            saveMessages(messages);
        }
    }, [messages, initialMessages]);

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
        
        // Return the ID so we can track this message
        return responseId;
    }, [mathIndex, normalIndex, longIndex]);

    const addMessage = useCallback(async (text: string, isUser: boolean) => {
        // Add user message
        const newMessage: Message = {
            id: generateMessageId(),
            text: text.trim(),
            isUser,
            isStreaming: false
        };

        console.log(`Adding ${isUser ? 'user' : 'AI'} message: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        
        // Update messages state with the new message
        setMessages(prev => {
            const updatedMessages = [...prev, newMessage];
            console.log(`Messages array updated, now contains ${updatedMessages.length} messages`);
            return updatedMessages;
        });

        // Get AI response when it's a user message
        if (isUser) {
            console.log('User message detected, preparing AI response...');
            setIsStreaming(true);
            
            try {
                // Check if we should use API or simulated response
                if (useApiResponse) {
                    console.log('Using API response...');
                    const responseId = generateMessageId();
                    
                    // Add initial empty message for API response
                    setMessages(prev => {
                        const messagesWithEmptyResponse = [...prev, {
                            id: responseId,
                            text: '',
                            isUser: false,
                            isStreaming: true
                        }];
                        return messagesWithEmptyResponse;
                    });
                    
                    // Get current messages including the user message we just added
                    const currentMessages = [...messages, newMessage];
                    
                    // Try to get AI response from API
                    console.log('Calling getAIResponse with messages:', currentMessages.length);
                    const response = await getAIResponse(currentMessages);
                    
                    console.log('Received API response:', response.content.substring(0, 50) + (response.content.length > 50 ? '...' : ''));
                    
                    // Store the full API response
                    setLastApiResponse(response);
                    
                    // Get the content from the response
                    const fullResponse = response.content;
                    
                    // Determine streaming parameters based on content length
                    const isLongResponse = fullResponse.length > 100;
                    const baseDelay = isLongResponse ? 5 : 15;
                    const batchSize = isLongResponse ? 15 : 5;

                    console.log(`Streaming response with baseDelay=${baseDelay}, batchSize=${batchSize}`);
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
                } else {
                    // Use simulated response directly without creating an empty message first
                    await simulateResponse(text);
                }
            } catch (error) {
                console.log('Falling back to simulated response');
                // If API fails, use simulated response
                await simulateResponse(text);
            }

            setIsStreaming(false);
        }
    }, [messages, simulateResponse, useApiResponse]);

    const toggleUseApiResponse = useCallback(() => {
        setUseApiResponse(prev => !prev);
    }, []);

    // Clear all messages from state and storage
    const clearMessages = useCallback(async () => {
        setMessages([]);
        if (initialMessages.length === 0) {
            // Only clear AsyncStorage if we're not using initialMessages (session-based)
            await saveMessages([]);
        }
    }, [initialMessages]);

    return {
        messages,
        setMessages,
        isStreaming,
        addMessage,
        lastApiResponse,
        useApiResponse,
        toggleUseApiResponse,
        clearMessages
    };
};