import React from 'react';
import { View } from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

interface MathServiceProps {
  expression: string;
  style?: any;
}

export const MathService: React.FC<MathServiceProps> = ({ expression, style }) => {
  // Remove outer delimiters for processing
  const processedExpression = expression
    .replace(/^\$\$|\$\$$/g, '')
    .replace(/^\$|\$$/g, '');

  return (
    <View style={[{ backgroundColor: 'transparent' }, style]}>
      <MathJaxSvg
        fontSize={18}
        fontCache={true}
        
      >
        {processedExpression}
      </MathJaxSvg>
    </View>
  );
};