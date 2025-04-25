import { MessageItem } from '@/components/Chat/MessageItem';
import CustomBottomSheet from '@/components/Common/BottomSheet';
import HamburgerMenu from '@/components/Common/HamburgerMenu';
import ChatInput from '@/components/Home/ChatInput';
import { useChat } from '@/hooks/useChat';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function Chat() {
    const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const initialMessageProcessed = useRef(false);
    const [showApiInfo, setShowApiInfo] = useState(false);

    const {
        messages,
        isStreaming,
        addMessage,
        lastApiResponse,
        useApiResponse,
        toggleUseApiResponse
    } = useChat();

    // Process initial message and trigger AI response
    useEffect(() => {
        if (initialMessage && !initialMessageProcessed.current) {
            initialMessageProcessed.current = true;
            addMessage(initialMessage, true);
        }
    }, [initialMessage, addMessage]);

    const handleInputChange = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (inputText.trim() && !isStreaming) {
            await addMessage(inputText.trim(), true);
            setInputText("");

            // Scroll to bottom after sending message
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [inputText, isStreaming, addMessage]);

    const toggleApiInfo = useCallback(() => {
        setShowApiInfo(prev => !prev);
    }, []);

    const toggleBottomSheet = useCallback(() => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.present();
        }
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-zinc-900">
            <BottomSheetModalProvider>
                <StatusBar style="light" />
                <View className="flex-row justify-between items-center p-4 border-b border-zinc-700 mb-2">
                    <TouchableOpacity className="bg-zinc-700 px-4 py-2 rounded-full flex-row items-center">
                        <Text className="text-white mr-1">Fluey AI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleBottomSheet}>
                        <HamburgerMenu onPress={toggleBottomSheet} />
                    </TouchableOpacity>
                </View>

                {showApiInfo && lastApiResponse && (
                    <View className="mx-4 mb-2 p-3 bg-zinc-800 rounded-lg">
                        <Text className="text-white text-xs mb-1">Model: {lastApiResponse.model}</Text>
                        <Text className="text-white text-xs mb-1">Provider: {lastApiResponse.provider}</Text>
                        <Text className="text-white text-xs">
                            Tokens: {lastApiResponse.usage.prompt_tokens} prompt / {lastApiResponse.usage.completion_tokens} completion
                        </Text>
                    </View>
                )}

                <View className="flex-1">
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <MessageItem message={item} />
                        )}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        className="flex-1 px-4"
                    />
                    <ChatInput
                        inputText={inputText}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                        disabled={isStreaming}
                    />
                </View>


                <CustomBottomSheet
                    bottomSheetModalRef={bottomSheetModalRef}
                    showApiInfo={showApiInfo}
                    toggleApiInfo={toggleApiInfo}
                    useApiResponse={useApiResponse}
                    toggleUseApiResponse={toggleUseApiResponse}
                    apiInfo={lastApiResponse ? {
                        model: lastApiResponse.model,
                        provider: lastApiResponse.provider,
                        promptTokens: lastApiResponse.usage.prompt_tokens,
                        completionTokens: lastApiResponse.usage.completion_tokens
                    } : undefined}
                />
            </BottomSheetModalProvider>
        </SafeAreaView>
    );
}