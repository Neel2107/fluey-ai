import { MessageItem } from '@/components/Chat/MessageItem';
import CustomBottomSheet from '@/components/Common/BottomSheet';
import HamburgerMenu from '@/components/Common/HamburgerMenu';
import ChatInput from '@/components/Home/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, ArrowLeft, Menu } from 'lucide-react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  // Get chat session from store
  const { 
    getSession, 
    updateSession, 
    addMessageToSession, 
    deleteSession 
  } = useChatStore();
  
  const session = useChatStore(state => 
    state.sessions.find(s => s.id === id)
  );

  // Initialize chat hook with session messages
  const {
    messages,
    setMessages,
    isStreaming,
    addMessage,
    lastApiResponse,
    useApiResponse,
    toggleUseApiResponse,
    clearMessages
  } = useChat(session?.messages || []);

  // Sync messages back to the store when they change
  useEffect(() => {
    if (id && messages.length > 0) {
      updateSession(id, messages);
    }
  }, [id, messages, updateSession]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (inputText.trim() && !isStreaming && id) {
      await addMessage(inputText.trim(), true);
      setInputText("");

      // Scroll to bottom after sending message
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [inputText, isStreaming, addMessage, id]);

  const toggleApiInfo = useCallback(() => {
    setShowApiInfo(prev => !prev);
  }, []);

  const toggleBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages in this chat?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearMessages();
            if (id) {
              updateSession(id, []);
            }
          }
        }
      ]
    );
  }, [clearMessages, id, updateSession]);

  const handleDeleteChat = useCallback(() => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (id) {
              deleteSession(id);
              navigation.navigate('index');
            }
          }
        }
      ]
    );
  }, [id, deleteSession, navigation]);

  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  // If session doesn't exist, return to home
  useEffect(() => {
    if (!session && id) {
      navigation.navigate('index');
    }
  }, [session, id, navigation]);

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <BottomSheetModalProvider>
        <StatusBar style="light" />
        <View className="flex-row justify-between items-center p-4 border-b border-zinc-700 mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={openDrawer}
              className="mr-3"
            >
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white font-medium" numberOfLines={1} ellipsizeMode="tail">
              {session.title}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity onPress={toggleBottomSheet}>
              <HamburgerMenu onPress={toggleBottomSheet} />
            </TouchableOpacity>
          </View>
        </View>

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
          clearMessages={handleClearChat}
          deleteChat={handleDeleteChat}
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
