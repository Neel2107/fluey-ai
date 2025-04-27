import { Message } from '@/types/chat';
import { getAIResponse } from '@/utils/api';
import { generateMessageId } from '@/utils/messageUtils';
import { loadMessages, saveMessages } from '@/utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';


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
    const isStreamingRef = useRef(false);
    const currentStreamingIdRef = useRef<string | null>(null);
    const messagesRef = useRef<Message[]>([]);

    // Initialize state
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isStreaming, setIsStreaming] = useState(false);
    const [normalIndex, setNormalIndex] = useState(0);
    const [mathIndex, setMathIndex] = useState(0);
    const [longIndex, setLongIndex] = useState(0);
    // const [lastApiResponse, setLastApiResponse] = useState<AIResponse | null>(null);
    const [useApiResponse, setUseApiResponse] = useState(true);

    // Update messagesRef when messages change
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

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
        }
    }, [initialMessages.length]);

    // Save messages to AsyncStorage whenever they change
    useEffect(() => {
        if (messages.length > 0 && initialMessages.length === 0) {
            saveMessages(messages);
        }
    }, [messages, initialMessages.length]);

    const simulateResponse = useCallback(async (userText: string) => {
        setIsStreaming(true);
        isStreamingRef.current = true;

        const responseId = generateMessageId();
        currentStreamingIdRef.current = responseId;

        // Add initial empty message
        setMessages(prev => [...prev, {
            id: responseId,
            text: '',
            isUser: false,
            isStreaming: true
        }]);

        const isMathRequest = userText.toLowerCase().trim() === 'math';
        const isLongRequest = userText.toLowerCase().includes('long');

        // Get appropriate response based on request type
        let fullResponse: string;
        if (isMathRequest) {
            fullResponse = MATH_EXAMPLES[mathIndex];
            setMathIndex(prev => (prev + 1) % MATH_EXAMPLES.length);
        } else if (isLongRequest) {
            fullResponse = LONG_RESPONSES[longIndex];
            setLongIndex(prev => (prev + 1) % LONG_RESPONSES.length);
        } else {
            fullResponse = NORMAL_RESPONSES[normalIndex];
            setNormalIndex(prev => (prev + 1) % NORMAL_RESPONSES.length);
        }

        // Stream the response
        let currentText = '';
        const isLongResponse = fullResponse.length > 100;
        const baseDelay = isLongResponse ? 5 : 15;
        const batchSize = isLongResponse ? 15 : 5;

        for (let i = 0; i < fullResponse.length; i += batchSize) {
            if (!isStreamingRef.current) break;

            await new Promise(resolve => setTimeout(resolve, baseDelay));
            const endIndex = Math.min(i + batchSize, fullResponse.length);
            currentText += fullResponse.substring(i, endIndex);

            setMessages(prev => prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, text: currentText }
                    : msg
            ));
        }

        // Final update to mark streaming as complete
        if (isStreamingRef.current) {
            setMessages(prev => prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, isStreaming: false }
                    : msg
            ));
        }

        setIsStreaming(false);
        isStreamingRef.current = false;
        currentStreamingIdRef.current = null;
    }, [mathIndex, normalIndex, longIndex]);

    const addMessage = useCallback(async (text: string, isUser: boolean, forceNextFail: boolean = false) => {
        // Add user message
        const newMessage: Message = {
            id: generateMessageId(),
            text: text.trim(),
            isUser,
            isStreaming: false
        };

        // Update messages state with the new message
        setMessages(prev => [...prev, newMessage]);

        // Get AI response when it's a user message
        if (isUser) {
            setIsStreaming(true);
            isStreamingRef.current = true;

            try {
                if (useApiResponse) {
                    const responseId = generateMessageId();
                    currentStreamingIdRef.current = responseId;

                    // Add initial empty message for API response
                    setMessages(prev => [...prev, {
                        id: responseId,
                        text: '',
                        isUser: false,
                        isStreaming: true,
                        failed: false
                    }]);

                    // Get current messages including the user message we just added
                    const currentMessages = [...messagesRef.current, newMessage];
                    console.log('Fetching AI response...');
                    const response = await getAIResponse(currentMessages, { simulateFlaky: forceNextFail });
                    console.log('AI response received, length:', response.content.length);

                    // Immediately update with at least some content to avoid showing skeleton indefinitely
                    setMessages(prev => prev.map(msg =>
                        msg.id === responseId
                            ? { ...msg, text: response.content.substring(0, 1) }
                            : msg
                    ));

                    const fullResponse = response.content;
                    
                    // Dynamically adjust batch size and delay based on response length
                    // For very long responses, use larger batches and shorter delays
                    let batchSize, baseDelay;
                    const responseLength = fullResponse.length;
                    
                    if (responseLength > 10000) {
                        // Very long responses (>10K chars)
                        batchSize = Math.max(50, Math.floor(responseLength / 200));
                        baseDelay = 2;
                    } else if (responseLength > 5000) {
                        // Long responses (5K-10K chars)
                        batchSize = Math.max(30, Math.floor(responseLength / 250));
                        baseDelay = 3;
                    } else if (responseLength > 1000) {
                        // Medium responses (1K-5K chars)
                        batchSize = Math.max(20, Math.floor(responseLength / 300));
                        baseDelay = 5;
                    } else if (responseLength > 500) {
                        // Short-medium responses (500-1K chars)
                        batchSize = 15;
                        baseDelay = 8;
                    } else {
                        // Short responses (<500 chars)
                        batchSize = 5;
                        baseDelay = 15;
                    }
                    
                    console.log(`Optimized streaming: ${responseLength} chars, batch size: ${batchSize}, delay: ${baseDelay}ms`);

                    let currentText = fullResponse.substring(0, 1); // Start with the first character we already set
                    
                    try {
                        for (let i = batchSize; i < fullResponse.length; i += batchSize) {
                            if (!isStreamingRef.current) break;
                            
                            await new Promise(resolve => setTimeout(resolve, baseDelay));
                            const endIndex = Math.min(i + batchSize, fullResponse.length);
                            currentText += fullResponse.substring(i, endIndex);
                            
                            // Only log every few updates to reduce console noise
                            if (i % (batchSize * 5) === 0 || i >= fullResponse.length - batchSize) {
                                console.log(`Streaming update: ${i}/${fullResponse.length} characters (${Math.round(i/fullResponse.length*100)}%)`);
                            }
                             
                            // Update message with current text
                            setMessages(prev => prev.map(msg =>
                                msg.id === responseId
                                    ? { ...msg, text: currentText }
                                    : msg
                            ));
                            
                            // For very long responses, we don't need to wait for rendering on every batch
                            // Only add extra render delay for smaller responses or periodically for long ones
                            if (responseLength < 1000 || i % (batchSize * 3) === 0) {
                                await new Promise(resolve => setTimeout(resolve, 5));
                            }
                        }
                    } catch (streamError) {
                        console.error('Error during streaming:', streamError);
                        // If streaming fails, at least show the full response
                        setMessages(prev => prev.map(msg =>
                            msg.id === responseId
                                ? { ...msg, text: fullResponse, isStreaming: false }
                                : msg
                        ));
                    }

                    // Final update to mark streaming as complete
                    if (isStreamingRef.current) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === responseId
                                ? { ...msg, isStreaming: false }
                                : msg
                        ));
                    }
                } else {
                    await simulateResponse(text);
                }
            } catch (error) {
                console.error('Error getting AI response:', error);
                // Update the streaming message to show error state
                if (currentStreamingIdRef.current) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === currentStreamingIdRef.current
                            ? { ...msg, failed: true, isStreaming: false }
                            : msg
                    ));
                }
            } finally {
                setIsStreaming(false);
                isStreamingRef.current = false;
                currentStreamingIdRef.current = null;
            }
        }
    }, [useApiResponse, simulateResponse]);

    const toggleUseApiResponse = useCallback(() => {
        setUseApiResponse(prev => !prev);
    }, []);

    const clearMessages = useCallback(async () => {
        setMessages([]);
        if (initialMessages.length === 0) {
            await saveMessages([]);
        }
    }, [initialMessages.length]);

    // Cleanup function to stop streaming when component unmounts
    useEffect(() => {
        return () => {
            isStreamingRef.current = false;
        };
    }, []);

    return {
        messages,
        setMessages,
        isStreaming,
        setIsStreaming,
        addMessage,
        useApiResponse,
        toggleUseApiResponse,
        clearMessages
    };
};