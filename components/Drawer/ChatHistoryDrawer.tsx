import { useChatStore } from '@/store/chatStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Plus, MessageSquare, Trash2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { format } from 'date-fns';

interface ChatHistoryDrawerProps {
  // Props from drawer navigation
  [key: string]: any;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = (props) => {
  const { sessions, createSession, deleteSession } = useChatStore();

  const handleNewChat = useCallback(() => {
    // Create a new empty session
    const sessionId = createSession();
    // Navigate to the new chat
    router.push(`/chat/${sessionId}`);
    // Close the drawer
    props.navigation.closeDrawer();
  }, [createSession, props.navigation]);

  const handleChatSelect = useCallback((sessionId: string) => {
    // Navigate to the selected chat
    router.push(`/chat/${sessionId}`);
    // Close the drawer
    props.navigation.closeDrawer();
  }, [props.navigation]);

  const handleDeleteChat = useCallback((sessionId: string, sessionTitle: string) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${sessionTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSession(sessionId)
        }
      ]
    );
  }, [deleteSession]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <DrawerContentScrollView
      {...props}
      className="flex-1 px-4"
    >
      <View className="mb-6 py-2">
        <Text className="text-2xl font-bold text-white">Fluey AI</Text>
      </View>

      <TouchableOpacity
        className="flex-row items-center bg-blue-500 py-3 px-4 rounded-lg mb-4"
        onPress={handleNewChat}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#fff" />
        <Text className="text-white text-base font-medium ml-2">New Chat</Text>
      </TouchableOpacity>

      <View className="h-[1px] bg-zinc-800 mb-4" />

      <Text className="text-base font-medium text-zinc-400 mb-3">Chat History</Text>

      {sessions.length === 0 ? (
        <View className="items-center justify-center py-6">
          <MessageSquare size={24} color="#a1a1aa" />
          <Text className="text-zinc-400 mt-2">No chat history yet</Text>
        </View>
      ) : (
        <View className="mb-4">
          {sessions.map(session => (
            <View key={session.id} className="flex-row items-center mb-2">
              <TouchableOpacity
                className="flex-1 py-3 px-3 bg-zinc-800 rounded-lg"
                onPress={() => handleChatSelect(session.id)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium mb-1" numberOfLines={1} ellipsizeMode="tail">
                    {session.title}
                  </Text>
                  <Text className="text-zinc-400 text-xs">
                    {formatDate(session.updatedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 ml-2"
                onPress={() => handleDeleteChat(session.id, session.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </DrawerContentScrollView>
  );
};

export default ChatHistoryDrawer;
