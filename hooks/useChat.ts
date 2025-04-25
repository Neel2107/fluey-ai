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

        // Get current example and increment index (loop back to 0 if we reach the end)
        const currentExample = MARKDOWN_EXAMPLES[currentExampleIndex];

        // Add the response message with both title and content
        setMessages(prev => [...prev, {
            id: responseId,
            text: `**${currentExample.title}**\n\n${currentExample.content}`,
            isUser: false,
            isStreaming: false
        }]);

        // Update the index after sending the message
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