import SuggestionChip from "@/components/Common/SuggestionChip";
import ChatInput from "@/components/Home/ChatInput";
import {
  BarChart3,
  FileText,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Plus,
  UserCircle,
  Image
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';

export default function Index() {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (text: string) => {
    setInputText(text);
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      router.push({
          pathname: "/chat",
          params: { initialMessage: inputText }
      });
      setInputText("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">

      <View className="flex-row justify-between items-center p-4 border-b border-zinc-700">
        <TouchableOpacity>
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
          <SuggestionChip icon={MoreHorizontal} text="More" />
        </View>
      </ScrollView>

      <ChatInput
        inputText={inputText}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
