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
import { Skeleton } from '../Common/Skeleton';

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
        /\$\$.*?\$\$/, // Block math
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
        if (message.isStreaming) {
            return (
                <View style={{ gap: 8 }}>
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={16} />
                </View>
            );
        }

        if (isMathExpression) {
            return (
                <MathView
                    math={message.text.replace(/^\$|\$$/g, '')}
                    style={{ backgroundColor: 'transparent' }}
                />
            );
        }

        if (containsMarkdown(message.text)) {
            return <MarkdownRenderer content={message.text} />;
        }

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
                className={`p-3 rounded-2xl max-w-[80%] ${message.isUser
                        ? 'bg-zinc-800 rounded-tr-none'
                        : 'bg-zinc-700 rounded-tl-none'
                    }`}
            >
                {renderContent()}
            </Animated.View>
        </Animated.View>
    );
};