import {
    Plus,
    Search,
    Send
} from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

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
            <View className="p-4 pt-2">
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
                        />
                        <TouchableOpacity
                            onPress={onSubmit}
                            className="p-1"
                            disabled={disabled}
                        >
                            <Search color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={onSubmit}
                        className="p-2 mr-1">
                        <Send color="white" size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ChatInput;