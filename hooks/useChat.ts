import { Message } from '@/types/chat';
import { MARKDOWN_EXAMPLES } from '@/utils/markdownExamples';
import { generateMessageId } from '@/utils/messageUtils';
import { useCallback, useState } from 'react';

export const useChat = (initialMessage?: string) => {
    const [messages, setMessages] = useState<Message[]>(
        initialMessage ? [{ id: generateMessageId(), text: initialMessage, isUser: true }] : []
    );
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

    const simulateResponse = useCallback(async () => {
        setIsStreaming(true);
        const responseId = generateMessageId();

        // Get current example
        const currentExample = MARKDOWN_EXAMPLES[currentExampleIndex];
        const fullResponse = `**${currentExample.title}**\n\n${currentExample.content}`;

        // Add initial empty message
        setMessages(prev => [...prev, {
            id: responseId,
            text: '',
            isUser: false,
            isStreaming: true
        }]);

        // Split response into chunks (words)
        const words = fullResponse.split(' ');
        let streamedText = '';

        // Stream each word with a delay
        for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
            streamedText += (i === 0 ? '' : ' ') + words[i];
            
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === responseId
                        ? { ...msg, text: streamedText }
                        : msg
                )
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

        // Update the index for next response
        setCurrentExampleIndex((prevIndex) =>
            (prevIndex + 1) % MARKDOWN_EXAMPLES.length
        );

        setIsStreaming(false);
    }, [currentExampleIndex]);

    const addMessage = useCallback(async (text: string, isUser: boolean) => {
        // Add user message
        setMessages(prev => [...prev, {
            id: generateMessageId(),
            text: text.trim(),
            isUser
        }]);

        // Simulate AI response when it's a user message
        if (isUser) {
            await simulateResponse();
        }
    }, [simulateResponse]);

    return {
        messages,
        isStreaming,
        addMessage,
    };
};