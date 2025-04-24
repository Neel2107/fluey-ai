import { useCallback, useState } from 'react';
import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';

export const useChat = (initialMessage?: string) => {
    const [messages, setMessages] = useState<Message[]>(
        initialMessage ? [{ id: generateMessageId(), text: initialMessage, isUser: true }] : []
    );
    const [isStreaming, setIsStreaming] = useState(false);

    const simulateStreamingResponse = async (response: string) => {
        setIsStreaming(true);
        const words = response.split(' ');
        let streamedText = '';
        const responseId = generateMessageId();

        setMessages(prev => [...prev, { id: responseId, text: '', isUser: false, isStreaming: true }]);

        for (let word of words) {
            await new Promise(resolve => setTimeout(resolve, 100));
            streamedText += (streamedText ? ' ' : '') + word;
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === responseId
                        ? { ...msg, text: streamedText }
                        : msg
                )
            );
        }

        setMessages(prev =>
            prev.map(msg =>
                msg.id === responseId
                    ? { ...msg, isStreaming: false }
                    : msg
            )
        );
        setIsStreaming(false);
    };

    const addMessage = useCallback((text: string, isUser: boolean) => {
        const newMessage = {
            id: generateMessageId(),
            text: text.trim(),
            isUser
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    return {
        messages,
        isStreaming,
        simulateStreamingResponse,
        addMessage
    };
};