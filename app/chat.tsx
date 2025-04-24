import ChatInput from '@/components/Home/ChatInput';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import Animated, {
    FadeIn,
    LinearTransition
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isStreaming?: boolean;
}

export default function Chat() {
    const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: initialMessage as string, isUser: true }
    ]);
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleInputChange = (text: string) => {
        setInputText(text);
    };

    const simulateStreamingResponse = async (response: string) => {
        setIsStreaming(true);
        const words = response.split(' ');
        let streamedText = '';
        const responseId = Date.now().toString();

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

    const handleSubmit = () => {
        if (inputText.trim() && !isStreaming) {
            const newMessage = { id: Date.now().toString(), text: inputText.trim(), isUser: true };
            setMessages(prev => [...prev, newMessage]);
            setInputText("");

            // Simulate AI response
            simulateStreamingResponse("This is a simulated streaming response that demonstrates the progressive appearance of text in a natural way.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-900">
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((message) => (
                    <Animated.View
                        key={message.id + message.isUser}
                        entering={FadeIn.springify().damping(12)}
                        layout={LinearTransition.damping(14).springify()}
                        className={`mb-4 flex ${message.isUser ? 'items-end' : 'items-start'}`}
                    >
                        <Animated.Text
                            entering={message.isUser ? FadeIn.springify().damping(12) : FadeIn}
                            className={`p-3 rounded-2xl max-w-[80%] ${message.isUser
                                ? 'bg-zinc-800 rounded-tr-none'
                                : 'bg-zinc-700 rounded-tl-none'
                                } ${message.isStreaming ? 'opacity-70' : ''}`}
                            style={{ color: 'white' }}
                        >
                            {message.text}
                        </Animated.Text>
                    </Animated.View>
                ))}
            </ScrollView>
            <ChatInput
                inputText={inputText}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                disabled={isStreaming}
            />
        </SafeAreaView>
    );
}