import { MessageItem } from '@/components/Chat/MessageItem';
import CustomBottomSheet from '@/components/Common/BottomSheet';
import HamburgerMenu from '@/components/Common/HamburgerMenu';
import ChatInput from '@/components/Home/ChatInput';
import { useChatSession } from '@/hooks/useChatSession';
import { Message } from '@/types/chat';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreenContainer } from '../_layout';
import ChatMessages from '@/components/Chat/ChatMessages';

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlashList<Message>>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [forceNextFail, setForceNextFail] = useState(false);

  // Use our new chat session hook to manage all chat state
  const {
    session,
    messages,
    isStreaming,
    sendMessage,
    deleteSession,
    clearMessages,
    toggleUseApiResponse,
    useApiResponse,
    handleRetry
  } = useChatSession(id);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 10);
    }
  }, [messages.length]);

  const handleSubmit = useCallback(async () => {
    if (inputText.trim() && !isStreaming) {
      setInputText('');
      const success = await sendMessage(inputText.trim(), forceNextFail);
      if (success) {
        Keyboard.dismiss();
        if (forceNextFail) setForceNextFail(false);
      }
    }
  }, [sendMessage, forceNextFail, inputText, isStreaming]);


  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);


  // Add a dedicated effect to handle scrolling during streaming
  useEffect(() => {
    // Check if any message is currently streaming
    const streamingMessage = messages.find(msg => msg.isStreaming);
    
    if (streamingMessage) {
      // Create an interval to scroll while streaming is active
      const scrollInterval = setInterval(() => {
        if (listRef.current) {
          listRef.current.scrollToEnd({ animated: false });
        }
      }, 300); // Check every 300ms
      
      // Clean up interval when streaming stops
      return () => clearInterval(scrollInterval);
    }
  }, [messages, listRef]);

  const toggleBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      Keyboard.dismiss();
      bottomSheetModalRef.current.present();
    }
  }, []);

  const handleDeleteChat = useCallback(() => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = deleteSession();
            if (success) {
              navigation.navigate('index');
            }
          },
        },
      ]
    );
  }, [deleteSession, navigation]);

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
    <AnimatedScreenContainer
    >
      <SafeAreaView className="flex-1 bg-zinc-900">
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          <StatusBar style="light" />
          <View className="flex-row justify-between items-center p-4 pb-2 border-b border-zinc-700 mb-2">
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

          <View className="flex-1" style={{ flex: 1 }}>
          <ChatMessages 
              messages={messages}
              onRetry={handleRetry}
              isStreaming={isStreaming}
            />
            <ChatInput
              inputText={inputText}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              disabled={isStreaming}
            />
          </View>
        </KeyboardAvoidingView>
        <CustomBottomSheet
          bottomSheetModalRef={bottomSheetModalRef}
          useApiResponse={useApiResponse}
          toggleUseApiResponse={toggleUseApiResponse}
          deleteChat={handleDeleteChat}
          forceNextFail={forceNextFail}
          setForceNextFail={setForceNextFail}
        />

      </SafeAreaView>
    </AnimatedScreenContainer>
  );
}
export default ChatScreen;