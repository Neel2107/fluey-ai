import { Message } from '@/types/chat';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MathView from 'react-native-math-view';
import Animated, {
    FadeIn,
    FadeInRight,
    LinearTransition
} from 'react-native-reanimated';
import { Skeleton } from '../Common/Skeleton';
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
        /\$\$.*?\$\$/, // Block math
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
};

interface MessageItemProps {
    message: Message;
    onRetry?: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
    // Check if text is a simple math expression (wrapped in $ or $$)
    const isMathExpression = /^\$.*?\$$/.test(message.text.trim()) ||
        /^\$\$.*?\$\$/.test(message.text.trim());

    const renderContent = () => {


        if (message.isStreaming) {
            return (
                <View style={{ flexDirection: 'column', gap: 6 }}>
                    <Skeleton width={160} height={14} />
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={14} />
                </View>
            );
        }

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
        return <Text className="text-white text-base">{message.text}</Text>;
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
            {message.failed ?
                <View className="flex-row items-center  px-4 py-3 border border-[#392610] bg-[#2A2520] max-w-[80%] rounded-2xl">
                    <AlertCircle color="#FF6B00" size={20} />
                    <Text className="text-[#EA702D] ml-3 flex-1">
                        Hmm... something seems to have gone wrong.
                    </Text>
                    <TouchableOpacity
                        onPress={() => onRetry?.(message.id)}
                        className="ml-2"
                    >
                        <RotateCcw color="#EA702D" size={20} />
                    </TouchableOpacity>
                </View> : <Animated.View
                    entering={message.isUser
                        ? FadeInRight.damping(12)
                        : FadeIn.duration(500)}
                    className={`p-3 rounded-2xl ${message.isUser
                        ? 'bg-zinc-800 rounded-tr-none'
                        : 'bg-zinc-700 rounded-tl-none'}`}
                    style={{
                        minWidth: message.isStreaming && !message.failed ? 200 : 'auto',
                        maxWidth: '80%'
                    }}
                >
                    {renderContent()}
                </Animated.View>}

        </Animated.View>
    );
};