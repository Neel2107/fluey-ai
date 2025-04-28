import React, { useEffect, useRef } from 'react';
import { TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

interface TypewriterTextProps {
  text: string | undefined | null;
  durationPerWord?: number; // ms per word
  style?: TextStyle;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  durationPerWord = 80,
  style,
}) => {
  const safeText = typeof text === 'string' ? text : '';
  const words = safeText.split(' ');

  // Store opacities in a ref so we don't break the Rules of Hooks
  const opacities = useRef(words.map(() => useSharedValue(0)));

  // If the number of words changes, re-initialize the opacities array
  if (opacities.current.length !== words.length) {
    opacities.current = words.map(() => useSharedValue(0));
  }

  useEffect(() => {
    opacities.current.forEach((opacity, i) => {
      opacity.value = 0;
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 250 });
      }, i * durationPerWord);
    });
    // Reset on text change
    return () => {
      opacities.current.forEach(op => (op.value = 0));
    };
  }, [safeText, durationPerWord]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacities.current[i]?.value ?? 1,
        })) as TextStyle;
        return (
          <Animated.Text key={i} style={[style, animatedStyle]}>
            {word + (i < words.length - 1 ? ' ' : '')}
          </Animated.Text>
        );
      })}
    </View>
  );
};