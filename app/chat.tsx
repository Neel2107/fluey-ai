import ChatInput from '@/components/Home/ChatInput';
import { MessageItem } from '@/components/Chat/MessageItem';
import { useChat } from '@/hooks/useChat';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '@/types/chat';

export default function Chat() {
    const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);
    
    const {
        messages,
        isStreaming,
        simulateStreamingResponse,
        addMessage
    } = useChat(initialMessage as string);

    const handleInputChange = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleSubmit = useCallback(() => {
        if (inputText.trim() && !isStreaming) {
            addMessage(inputText.trim(), true);
            setInputText("");

            // Scroll to bottom immediately after user message
            flatListRef.current?.scrollToEnd({ animated: true });

            // Simulate AI response
            simulateStreamingResponse("This is a simulated streaming response that demonstrates the progressive appearance of text in a natural way.");
        }
    }, [inputText, isStreaming, addMessage, simulateStreamingResponse]);

    return (
        <SafeAreaView className="flex-1 bg-zinc-900">
            <StatusBar style='dark' />
            <View className="flex-row justify-center items-center p-4 border-b border-zinc-700">
                <TouchableOpacity className="bg-zinc-700 px-4 py-2 rounded-full flex-row items-center">
                    <Text className="text-white mr-1">Fluey AI</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => <MessageItem message={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10
                }}
            />
            <ChatInput
                inputText={inputText}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                disabled={isStreaming}
            />
        </SafeAreaView>
    );
}