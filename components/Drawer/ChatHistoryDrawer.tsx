import { useChatStore } from '@/store/chatStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Plus, MessageSquare, Trash2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fluey AI</Text>
      </View>

      <TouchableOpacity
        style={styles.newChatButton}
        onPress={handleNewChat}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Chat History</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageSquare size={24} color="#a1a1aa" />
          <Text style={styles.emptyStateText}>No chat history yet</Text>
        </View>
      ) : (
        <View style={styles.chatList}>
          {sessions.map(session => (
            <View key={session.id} style={styles.chatItem}>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => handleChatSelect(session.id)}
                activeOpacity={0.7}
              >
                <View style={styles.chatInfo}>
                  <Text style={styles.chatTitle} numberOfLines={1} ellipsizeMode="tail">
                    {session.title}
                  </Text>
                  <Text style={styles.chatDate}>
                    {formatDate(session.updatedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a1a1aa',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    color: '#a1a1aa',
    marginTop: 8,
  },
  chatList: {
    marginBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#27272a',
    borderRadius: 8,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  chatDate: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ChatHistoryDrawer;
