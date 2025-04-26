import SuggestionChip from "@/components/Common/SuggestionChip";
import ChatInput from "@/components/Home/ChatInput";
import { useChatStore } from "@/store/chatStore";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import {
    BarChart3,
    Calculator,
    FileText,
    Image,
    Lightbulb,
    Menu,
    MoreHorizontal,
    Plus,
    UserCircle
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView, useKeyboardAnimation } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedScreenContainer } from "./_layout";

export default function Index() {
  const [inputText, setInputText] = useState("");
  const createSession = useChatStore(state => state.createSession);
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const handleInputChange = (text: string) => {
    setInputText(text);
  };
  const { height, progress } = useKeyboardAnimation();

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const handleSubmit = () => {
    if (inputText.trim()) {
      // Create a new chat session with the initial message
      const sessionId = createSession(inputText.trim());

      // Navigate to the chat screen with the session ID
      router.push({
        pathname: "/(drawer)/chat/[id]",
        params: { id: sessionId }
      });

      setInputText("");
    }
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <AnimatedScreenContainer
    >
      <SafeAreaView className="flex-1 bg-zinc-900">
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          <StatusBar style='light' />
          <View className="flex-row justify-between items-center p-4 border-b border-zinc-700">
            <TouchableOpacity onPress={openDrawer}>
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-zinc-700 px-4 py-2 rounded-full flex-row items-center">
              <Text className="text-white mr-1">Get Plus</Text>
              <Plus color="white" size={16} />
            </TouchableOpacity>
            <TouchableOpacity>
              <UserCircle color="white" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView
            className="flex-1 px-4 pt-8"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <Text className="text-white text-2xl font-bold mb-6 text-center">
              What can I help with?
            </Text>
            <View className="flex-row flex-wrap justify-center">
              <SuggestionChip icon={Image} text="Create image" />
              <SuggestionChip icon={FileText} text="Summarize text" />
              <SuggestionChip icon={BarChart3} text="Analyze data" />
              <SuggestionChip icon={Lightbulb} text="Make a plan" />
              <SuggestionChip icon={Calculator} text="Math Examples" onPress={() => router.push('/math')} />
              <SuggestionChip icon={MoreHorizontal} text="More" />
            </View>
          </ScrollView>

          <ChatInput
            inputText={inputText}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedScreenContainer>
  );
}
