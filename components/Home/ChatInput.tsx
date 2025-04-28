import {
    Mic,
    Plus,
    Send
} from "lucide-react-native";
import React, { useState } from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";

interface ChatInputProps {
    inputText: string;
    onInputChange: (text: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
}

const MIN_HEIGHT = 54;
const MAX_HEIGHT = 120;
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);



const ChatInput: React.FC<ChatInputProps> = ({
    inputText,
    onInputChange,
    onSubmit,
    disabled
}) => {
    const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);

    return (
        <View style={{ backgroundColor: "#18181b" }}>
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                }}>
                <Animated.View
                    layout={LinearTransition.easing(Easing.inOut(Easing.cubic))}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#232329",
                        borderRadius: 24,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        height: inputHeight,
                        minHeight: MIN_HEIGHT,
                        maxHeight: MAX_HEIGHT,
                    }}>
                    {/* Left icons */}
                    <TouchableOpacity style={{ padding: 6, marginRight: 2 }}>
                        <Plus color="#a1a1aa" size={22} />
                    </TouchableOpacity>


                    {/* Expanding TextInput */}
                    <AnimatedTextInput
                        layout={LinearTransition.easing(Easing.inOut(Easing.cubic))}
                        style={{
                            flex: 1,
                            color: "#fff",
                            fontSize: 16,
                            minHeight: MIN_HEIGHT,
                            maxHeight: MAX_HEIGHT,
                            height: inputHeight,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            marginRight: 8,
                        }}
                        placeholder="Ask anything"
                        placeholderTextColor="#a1a1aa"
                        value={inputText}
                        onChangeText={onInputChange}
                        onSubmitEditing={onSubmit}
                        editable={!disabled}
                        cursorColor="#fff"
                        keyboardAppearance="dark"
                        returnKeyType="send"
                        enablesReturnKeyAutomatically
                        multiline
                        onContentSizeChange={e => {
                            const height = Math.min(
                                Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height),
                                MAX_HEIGHT
                            );
                            setInputHeight(height);
                        }}
                    />

                    {/* Right icons */}
                    <TouchableOpacity style={{ padding: 6, marginRight: 2 }}>
                        <Mic color="#a1a1aa" size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={disabled || !inputText.trim()}
                        className={`p-2 mr-1 ${(disabled || !inputText.trim()) ? 'opacity-50' : ''}`}>
                        <Send color="white" size={24} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

export default ChatInput;