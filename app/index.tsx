import {
  AudioWaveform,
  BarChart3,
  FileText,
  Image,
  Lightbulb,
  Menu,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  UserCircle,
} from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";



const SuggestionChip = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <TouchableOpacity className="bg-zinc-700 p-3 rounded-full flex-row items-center mr-2 mb-2">
    <Icon color="white" size={18} className="mr-2" />
    <Text className="text-white text-sm">{text}</Text>
  </TouchableOpacity>
);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* Header */}
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

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-4 pt-8"
        contentContainerStyle={{ paddingBottom: 100 }}
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

      {/* Bottom Input Area */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-700">
        <View className="flex-row items-center">
          <TouchableOpacity className="p-2 mr-2">
            <Plus color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-zinc-700 rounded-full px-4 py-2 mr-2">
            <TextInput
              placeholder="Ask anything"
              placeholderTextColor="#a1a1aa" // zinc-400
              className="flex-1 text-white mr-2"
            />
            <TouchableOpacity className="p-1">
              <Search color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="p-1 ml-1">
              <Sparkles color="white" size={20} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="p-2 mr-1">
            <Mic color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 bg-zinc-700 rounded-full">
            <AudioWaveform color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
