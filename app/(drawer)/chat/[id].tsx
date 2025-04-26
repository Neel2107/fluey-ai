import { MessageItem } from '@/components/Chat/MessageItem';
import CustomBottomSheet from '@/components/Common/BottomSheet';
import HamburgerMenu from '@/components/Common/HamburgerMenu';
import ChatInput from '@/components/Home/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types/chat';
import { getAIResponse } from '@/utils/api';
import { generateMessageId } from '@/utils/messageUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreenContainer } from '../_layout';

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const processingInitialMessage = useRef(false);
  const [forceNextFail, setForceNextFail] = useState(false);

  // Get chat session from store
  const {
    updateSession,
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
    clearMessages,
    setIsStreaming,
    setLastApiResponse
  } = useChat(session?.messages || []);

  // Process initial message if needed
  useEffect(() => {
    const processInitialMessage = async () => {
      // Only process if we have a session with exactly one user message
      // and we're not already processing
      if (session &&
        session.messages.length === 1 &&
        session.messages[0].isUser &&
        !processingInitialMessage.current) {

        processingInitialMessage.current = true;
        console.log('New session with initial message detected - WILL PROCESS');

        const streamingMessage: Message = {
          id: generateMessageId(),
          text: '',
          isUser: false,
          isStreaming: true
        };

        try {
          // Add a streaming message first
          setMessages(prev => [...prev, streamingMessage]);

          // Manually trigger the API response
          console.log('Setting isStreaming to true');
          setIsStreaming(true);

          // Get the user message
          const userMessage = session.messages[0].text;
          console.log('Initial user message to process:', userMessage);

          // Call the API directly - use the imported function
          console.log('Calling getAIResponse with session messages');
          const apiResponse = await getAIResponse([{
            id: session.messages[0].id,
            text: userMessage,
            isUser: true,
            isStreaming: false
          }]);

          console.log('API response received:', apiResponse ? 'success' : 'null');

          if (apiResponse) {
            console.log('Creating AI message with response content');
            // Create a new AI message
            const aiMessage: Message = {
              id: streamingMessage.id, // Use the same ID as the streaming message
              text: apiResponse.content,
              isUser: false,
              isStreaming: false
            };

            console.log('Updating messages state with AI response');
            // Update the streaming message with the actual content
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessage.id ? aiMessage : msg
            ));

            console.log('Updating lastApiResponse state');
            // Update the lastApiResponse state
            setLastApiResponse(apiResponse);

            console.log('Updating session in store');
            // Update the session in the store
            if (id) {
              const updatedMessages = [...session.messages, aiMessage];
              console.log('Updating session with messages count:', updatedMessages.length);
              updateSession(id, updatedMessages);
            }
          } else {
            console.error('API response was null or undefined');
            // Remove the streaming message if API call failed
            setMessages(prev => prev.filter(msg => msg.id !== streamingMessage.id));
          }
        } catch (error) {
          console.error('Error generating initial response:', error);
          // Remove the streaming message if there was an error
          setMessages(prev => prev.filter(msg => msg.id !== streamingMessage.id));
        } finally {
          console.log('Setting isStreaming to false');
          setIsStreaming(false);
          processingInitialMessage.current = false;
        }
      } else {
        if (processingInitialMessage.current) {
          console.log('Initial message already processed, skipping');
        } else if (!session) {
          console.log('No session available, skipping initial message processing');
        } else if (session.messages.length !== 1) {
          console.log('Session has', session.messages.length, 'messages, not processing initial message');
        } else if (!session.messages[0].isUser) {
          console.log('First message is not from user, skipping initial message processing');
        }
      }
    };

    if (session && session.messages.length === 1 && session.messages[0].isUser) {
      processInitialMessage();
    }
  }, [session?.messages]);

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
      await addMessage(inputText.trim(), true, forceNextFail);
      setInputText("");
      flatListRef.current?.scrollToEnd({ animated: true });
      if (forceNextFail) setForceNextFail(false);
    }
  }, [inputText, isStreaming, addMessage, id, forceNextFail]);

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

  // Retry handler for failed messages
  const handleRetry = async (messageId: string) => {
    // Mark the failed message as streaming again
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isStreaming: true, failed: false } : m
    ));
    try {
      setIsStreaming(true);
      const apiResponse = await getAIResponse([
        ...messages.filter(m => m.isUser || m.id === messageId)
      ], { simulateFlaky: forceNextFail });
      if (apiResponse) {
        // Replace the failed message with the new AI response
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, text: apiResponse.content, isStreaming: false, failed: false }
            : m
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, failed: true, isStreaming: false } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <AnimatedScreenContainer
    >


      <SafeAreaView className="flex-1 bg-zinc-900">
        <KeyboardAvoidingView className="flex-1" behavior="padding">


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
                <MessageItem message={item} onRetry={handleRetry} />
              )}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              className="flex-1 px-4"
              windowSize={5} // Add this to optimize rendering window
              maxToRenderPerBatch={10} // Limit batch rendering
              removeClippedSubviews={true} // Remove items outside viewport
              initialNumToRender={10} // Reduce initial render batch
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
          forceNextFail={forceNextFail}
          setForceNextFail={setForceNextFail}
        />

      </SafeAreaView>
    </AnimatedScreenContainer>
  );
}
export default ChatScreen;