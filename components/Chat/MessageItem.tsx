import { Message } from '@/types/chat';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInRight,
    LinearTransition
} from 'react-native-reanimated';
import { Skeleton } from '../Common/Skeleton';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypewriterText } from './TypewriterText';


const containsMarkdown = (text: string): boolean => {
    if (!text) return false;
    const markdownPatterns = [
        /^#+\s/m, // Headers
        /^\s*[-*+]\s/m, // Lists
        /^\s*\d+\.\s/m, // Numbered lists
        /```/, // Code blocks
        /\[.*?\]\(.*?\)/, // Links
        /^\s*>/m, // Blockquotes
        /\$.*?\$/, // Inline math
        /\$\$.*?\$\$/, // Block math
        /\|.*\|/, // Tables
        /[*_~]{2,}/, // Bold, italic, strikethrough
    ];
    return markdownPatterns.some(pattern => pattern.test(text));
};



interface MessageItemProps {
    message: Message;
    onRetry?: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
    const renderContent = () => {
        if (message.isStreaming && !message.text) {
            return (
                <View style={{ flexDirection: 'column', gap: 6 }}>
                    <Skeleton width={160} height={14} />
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={14} />
                </View>
            );
        }

        if (!message.text) return null;

        // Clean up text: normalize line breaks and remove extra spaces
        const cleanText = message.text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with 2
            .replace(/\s+\n/g, '\n') // Remove spaces before line breaks
            .replace(/\n\s+/g, '\n') // Remove spaces after line breaks
            .trim();

        if (containsMarkdown(cleanText)) {
            return <MarkdownRenderer content={cleanText} />;
        }

        if (message.isUser) {
            return (
                <Text style={{ color: 'white', fontSize: 16, lineHeight: 24 }}>
                    {cleanText}
                </Text>
            );
        }

        return (
            <TypewriterText 
                text={cleanText}
                style={{ color: 'white', fontSize: 16, lineHeight: 24 }}
            />
        );
    };

    return (
        <Animated.View
            key={message.id}
            entering={message.isUser ? FadeInRight.damping(12) : FadeIn.duration(300)}
            layout={LinearTransition.damping(14)}
            className={`mb-2 flex ${message.isUser ? 'items-end' : 'items-start'}`}
        >
            {message.failed ? (
                <View className="flex-row items-center px-4 py-3 border border-[#392610] bg-[#2A2520] max-w-[80%] rounded-2xl">
                    <AlertCircle color="#FF6B00" size={20} />
                    <Text className="text-[#EA702D] ml-3 flex-1">
                        Hmm... something seems to have gone wrong.
                    </Text>
                    <TouchableOpacity onPress={() => onRetry?.(message.id)} className="ml-2">
                        <RotateCcw color="#EA702D" size={20} />
                    </TouchableOpacity>
                </View>
            ) : (
                <Animated.View
                    entering={message.isUser ? FadeInRight.damping(12) : FadeIn.duration(100)}
                    className={`p-3 rounded-2xl ${message.isUser ? 'bg-zinc-800 rounded-tr-none' : ''}`}
                    style={{
                        minWidth: message.isStreaming && !message.failed ? 200 : 'auto',
                        maxWidth: message.isUser ? '80%' : '90%',
                    }}
                >
                    {renderContent()}
                </Animated.View>
            )}
        </Animated.View>
    );
};