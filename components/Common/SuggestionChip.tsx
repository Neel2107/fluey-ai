import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface SuggestionChipProps {
    icon: any;
    text: string;
    onPress?: () => void;
}

const SuggestionChip = ({ icon: Icon, text, onPress }: SuggestionChipProps) => (
    <TouchableOpacity 
        className="bg-zinc-700 p-3 rounded-full flex-row items-center mr-2 mb-2"
        onPress={onPress}
    >
        <Icon color="white" size={18} className="mr-2" />
        <Text className="text-white ml-1 text-sm">{text}</Text>
    </TouchableOpacity>
);

export default SuggestionChip