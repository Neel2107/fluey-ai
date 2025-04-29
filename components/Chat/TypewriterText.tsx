import React, { useEffect, useRef } from 'react';
import { TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface AnimatedLineProps {
  line: string;
  index: number;
  currentIndex: Animated.SharedValue<number>;
  style?: TextStyle;
}

const AnimatedLine: React.FC<AnimatedLineProps> = ({
  line,
  index,
  currentIndex,
  style,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: currentIndex.value >= index ? withTiming(1, { duration: 250 }) : 0,
  })) as TextStyle;

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {line}
    </Animated.Text>
  );
};

interface TypewriterTextProps {
  text: string | undefined | null;
  durationPerLine?: number; // ms per line
  style?: TextStyle;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  durationPerLine = 150,
  style,
}) => {
  const safeText = typeof text === 'string' ? text : '';
  
  // Split by line breaks while preserving empty lines for spacing
  const lines = safeText.split(/\n/).map(line => line.trim());
  
  // Create a single shared value for the current line index
  const currentLineIndex = useSharedValue(-1);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Reset the animation
    currentLineIndex.value = -1;

    // Start the animation
    lines.forEach((_, i) => {
      const timeout = setTimeout(() => {
        currentLineIndex.value = i;
      }, i * durationPerLine);
      timeoutsRef.current.push(timeout);
    });

    // Cleanup
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      currentLineIndex.value = -1;
    };
  }, [safeText, durationPerLine, lines.length]);

  return (
    <View style={{ flexDirection: 'column' }}>
      {lines.map((line, i) => (
        <AnimatedLine
          key={i}
          line={line}
          index={i}
          currentIndex={currentLineIndex}
          style={style}
        />
      ))}
    </View>
  );
};