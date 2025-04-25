import { Message } from '@/types/chat';
import React from 'react';
import { Text, View } from 'react-native';
import MathView from 'react-native-math-view';
import Animated, {
    FadeIn,
    FadeInRight,
    LinearTransition
} from 'react-native-reanimated';
import { MarkdownRenderer } from './MarkdownRenderer';

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
        /\$.*?\$/, // Inline math
        /\$\$.*?\$\$$/, // Block math
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
};

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    // Check if text is a simple math expression (wrapped in $ or $$)
    const isMathExpression = /^\$.*?\$$/.test(message.text.trim()) ||
        /^\$\$.*?\$\$$/.test(message.text.trim());

    const renderContent = () => {
        // For math expressions
        if (isMathExpression) {
            return (
                <MathView
                    math={message.text.replace(/^\$|\$$/g, '')}
                    style={{ backgroundColor: 'transparent' }}
                />
            );
        }

        // For markdown content
        if (containsMarkdown(message.text)) {
            return <MarkdownRenderer content={message.text} />;
        }

        // For plain text
        return <Text className="text-white">{message.text}</Text>;
    };

    return (
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
                className={`p-3 rounded-2xl ${message.isUser
                    ? 'bg-zinc-800 rounded-tr-none'
                    : 'bg-zinc-700 rounded-tl-none'}`}
                style={{
                    maxWidth: '80%',
                }}
            >
                {renderContent()}
            </Animated.View>
        </Animated.View>
    );
};