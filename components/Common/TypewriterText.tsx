import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface TypewriterTextProps extends TextProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  isActive?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  typingSpeed = 50,
  onComplete,
  isActive = true,
  style,
  ...rest
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (!isActive) return;

    let index = 0;
    setIsComplete(false);
    
    // Reset display text when the target text changes
    if (displayText !== text.substring(0, displayText.length)) {
      setDisplayText('');
      opacity.value = withTiming(1, { duration: 300 });
    }

    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed, isActive]);

  return (
    <Animated.Text style={[animatedStyle, style]} {...rest}>
      {displayText}
    </Animated.Text>
  );
};

export default TypewriterText;
