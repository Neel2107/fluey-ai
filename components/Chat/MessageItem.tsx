import { Message } from '@/types/chat';
import React from 'react';
import Animated, {
    FadeIn,
    FadeInRight,
    LinearTransition
} from 'react-native-reanimated';
import { MarkdownRenderer } from './MarkdownRenderer';

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
                ? 'bg-zinc-800 rounded-tr-none'
                : 'bg-zinc-700 rounded-tl-none'
                } ${message.isStreaming ? 'opacity-70' : ''}`}
        >
            <MarkdownRenderer content={message.text} />
        </Animated.View>
    </Animated.View>
);