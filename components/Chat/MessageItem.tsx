import { Message } from '@/types/chat';
import React from 'react';
import Animated, {
    FadeIn,
    FadeInRight,
    LinearTransition
} from 'react-native-reanimated';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Text } from 'react-native';

const containsMarkdown = (text: string): boolean => {
    // Check for common Markdown patterns
    const markdownPatterns = [
        /[*_~`]/, // Bold, italic, strikethrough, inline code
        /\[.*?\]\(.*?\)/, // Links
        /^#+\s/, // Headers
        /^\s*[-*+]\s/, // Lists
        /^\s*\d+\.\s/, // Numbered lists
        /```/, // Code blocks
        /\|.*\|/, // Tables
        /^\s*>/, // Blockquotes
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
};

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => (
    <Animated.View
        key={message.id}
        entering={message.isUser
            ? FadeInRight.damping(12)
            : FadeIn.duration(300)}
        layout={LinearTransition.damping(14)}
        className={`mb-4 flex ${message.isUser ? 'items-end' : 'items-start'}`}
    >
        <Animated.View
            entering={message.isUser
                ? FadeInRight.damping(12)
                : FadeIn.duration(500)}
            className={`p-3 rounded-2xl max-w-[80%] ${message.isUser
                ? 'bg-zinc-800 rounded-tr-none '
                : 'bg-zinc-700 rounded-tl-none'} ${message.isStreaming ? 'opacity-70' : ''}`}
        >
            {containsMarkdown(message.text) ? (
                <MarkdownRenderer content={message.text} />
            ) : (
                <Text className="text-white">{message.text}</Text>
            )}
        </Animated.View>
    </Animated.View>
);