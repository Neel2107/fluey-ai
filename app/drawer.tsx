import ChatHistoryDrawer from '@/components/Drawer/ChatHistoryDrawer';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import Animated, { FadeIn, FadeOut, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DrawerLayout() {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const onDrawerStateChanged = (isOpen: boolean) => {
    scale.value = withSpring(isOpen ? 0.9 : 1, {
      damping: 15,
      stiffness: 100
    });
  };


  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="flex-1 bg-zinc-900"
    >
      <StatusBar style="light" backgroundColor="#18181b" />
      <Drawer
        defaultStatus="open"
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#18181b',
            width: '80%',
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          drawerContentStyle: {
            paddingTop: insets.top,
          },
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: '#a1a1aa',
        }}
        drawerContent={(props: DrawerContentComponentProps) => (
          <ChatHistoryDrawer
            {...props}
            onDrawerStateChanged={onDrawerStateChanged}
          />
        )}
      >
        <Drawer.Screen
          name="drawer/index"
          options={{
            title: 'Drawer Home',
            drawerLabel: 'Home',
          }}
        />
      </Drawer>
    </Animated.View>
  );
}
