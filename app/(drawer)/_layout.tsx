import { Drawer } from 'expo-router/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ChatHistoryDrawer from '@/components/Drawer/ChatHistoryDrawer';
import { useColorScheme, StyleSheet } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

export default function DrawerLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#18181b" />
      <Drawer
        defaultStatus="closed"
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#18181b',
            width: '80%',
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          // @ts-ignore - sceneContainerStyle exists but TypeScript doesn't recognize it
          sceneContainerStyle: {
            backgroundColor: '#18181b',
          },
          drawerContentStyle: {
            paddingTop: insets.top,
          },
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: '#a1a1aa',
        }}
        drawerContent={(props: DrawerContentComponentProps) => <ChatHistoryDrawer {...props} />}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="chat/[id]"
          options={{
            title: 'Chat',
            drawerLabel: 'Chat',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
