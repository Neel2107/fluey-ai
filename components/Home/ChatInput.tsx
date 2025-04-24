import {
    Mic,
    Plus,
    Search
} from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

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
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        opacity: opacity.value
    }));

    const handleSubmitWithAnimation = () => {
        scale.value = withSpring(0.95);
        translateY.value = withSpring(-100, {
            damping: 12,
            stiffness: 90
        });
        opacity.value = withTiming(0, {
            duration: 300
        }, () => {
            runOnJS(onSubmit)();
        });
    };

    return (
        <Animated.View
            className="bg-zinc-900 border-t border-zinc-700"
            style={animatedStyles}
        >
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
                            onPress={handleSubmitWithAnimation}
                            className="p-1"
                            disabled={disabled}
                        >
                            <Search color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity className="p-2 mr-1">
                        <Mic color="white" size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default ChatInput;