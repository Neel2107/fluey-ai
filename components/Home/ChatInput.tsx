import {
    Mic,
    Plus,
    Send
} from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View, Platform } from "react-native";

interface ChatInputProps {
    inputText: string;
    onInputChange: (text: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    inputText,
    onInputChange,
    onSubmit,
    disabled
}) => {
    return (
        <View className="bg-zinc-900 border-t border-zinc-700">
            <View className={`p-4 pt-2 ${Platform.OS === 'ios' ? 'pb-8' : ''}`}>
                <View className="flex-row items-center">
                    <TouchableOpacity className="p-2 mr-2">
                        <Plus color="white" size={24} />
                    </TouchableOpacity>
                    <View className={`flex-1 flex-row items-center bg-zinc-700 rounded-full px-4 py-2 mr-2 ${disabled ? 'opacity-50' : ''}`}>
                        <TextInput
                            placeholder="Ask anything"
                            placeholderTextColor="#a1a1aa"
                            className="flex-1 text-white mr-2"
                            value={inputText}
                            onChangeText={onInputChange}
                            onSubmitEditing={onSubmit}
                            editable={!disabled}
                            cursorColor="#fff"
                            keyboardAppearance="dark"
                            returnKeyType="send"
                            enablesReturnKeyAutomatically
                            // blurOnSubmit={false}
                        />
                        <TouchableOpacity
                            // onPress={onSubmit}
                            className="p-1"
                            disabled={disabled || !inputText.trim()}
                        >
                            <Mic color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={disabled || !inputText.trim()}
                        className={`p-2 mr-1 ${(disabled || !inputText.trim()) ? 'opacity-50' : ''}`}>
                        <Send color="white" size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ChatInput;