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
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreenContainer } from '../_layout';

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlashList<Message>>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
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
    useApiResponse,
    toggleUseApiResponse,
    clearMessages,
    setIsStreaming,
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
      
          // Auto-scroll to bottom when messages update
      if (messages.length > 0) {
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false });
        }, 10);
      }
    }
  }, [id, messages, updateSession]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  // Memoize the key extractor
  const keyExtractor = useCallback((item: Message) => item.id, []);
  
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
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (inputText.trim() && !isStreaming && id) {
      await addMessage(inputText.trim(), true, forceNextFail);
      setInputText('');
      Keyboard.dismiss();

      // Ensure we scroll to the bottom after adding a new message
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);

      if (forceNextFail) setForceNextFail(false);
    }
  }, [inputText, isStreaming, addMessage, id, forceNextFail]);

  const toggleBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      Keyboard.dismiss();
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
            <FlashList
              ref={listRef}
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <View className="px-4">
                  <MessageItem message={item} onRetry={handleRetry} />
                </View>
              )}
              onContentSizeChange={() => {
                // Only use animated scrolling when not streaming for better performance
                const isCurrentlyStreaming = messages.some(msg => msg.isStreaming);
                listRef.current?.scrollToEnd({ animated: !isCurrentlyStreaming });
              }}
              estimatedItemSize={100}
              estimatedListSize={{ height: 500, width: 400 }}
              className="flex-1"
              drawDistance={200}
              overrideItemLayout={(layout, item) => {
                // Optimize layout calculation for different message types
                if (item.isUser) {
                  // User messages are typically shorter
                  layout.size = Math.max(50, item.text.length / 5);
                } else if (item.isStreaming) {
                  // Streaming messages have a fixed height for the skeleton
                  layout.size = 80;
                } else {
                  // AI messages can be longer and more complex
                  layout.size = Math.max(80, item.text.length / 3);
                }
              }}
              viewabilityConfig={{
                minimumViewTime: 100,
                viewAreaCoveragePercentThreshold: 20,
              }}
              initialScrollIndex={messages.length > 0 ? messages.length - 1 : undefined}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
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
          clearMessages={handleClearChat}
          deleteChat={handleDeleteChat}
          forceNextFail={forceNextFail}
          setForceNextFail={setForceNextFail}
        />

      </SafeAreaView>
    </AnimatedScreenContainer>
  );
}
export default ChatScreen;