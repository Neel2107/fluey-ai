import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

interface MathServiceProps {
  expression: string;
  style?: any;
}

export const MathService: React.FC<MathServiceProps> = ({ expression, style }) => {
  const renderExpression = (expr: string) => {
    // Keep a copy of original expression for later comparison
    const originalExpr = expr;
    
    // Remove LaTeX delimiters for processing
    expr = expr.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');
    
    // Handle equations with = sign
    if (expr.includes('=')) {
      const parts = expr.split('=');
      const leftSide = parts[0].trim();
      const rightSide = parts[1].trim();
      
      // Check if right side contains superscript
      const rightParts = rightSide.split('^');
      
      if (rightParts.length === 2) {
        return (
          <Svg height="30" width="160" style={style}>
            <SvgText x="10" y="20" fontSize="16" fill="white">
              {leftSide}
            </SvgText>
            <SvgText x="30" y="20" fontSize="16" fill="white">
              =
            </SvgText>
            <SvgText x="50" y="20" fontSize="16" fill="white">
              {rightParts[0]}
            </SvgText>
            <SvgText x="70" y="12" fontSize="12" fill="white">
              {rightParts[1]}
            </SvgText>
          </Svg>
        );
      }
      
      return (
        <Svg height="30" width="160" style={style}>
          <SvgText x="10" y="20" fontSize="16" fill="white">
            {leftSide} = {rightSide}
          </SvgText>
        </Svg>
      );
    }
    
    // Handle simple superscripts
    const parts = expr.split('^');
    if (parts.length === 2) {
      return (
        <Svg height="30" width="100" style={style}>
          <SvgText x="10" y="20" fontSize="16" fill="white">
            {parts[0]}
          </SvgText>
          <SvgText x="25" y="12" fontSize="12" fill="white">
            {parts[1]}
          </SvgText>
        </Svg>
      );
    }

    // If we reach here and the original expression had delimiters,
    // we should preserve the math rendering
    if (originalExpr.startsWith('$') || originalExpr.startsWith('$$')) {
      return (
        <Svg height="30" width="100" style={style}>
          <SvgText x="10" y="20" fontSize="16" fill="white">
            {expr}
          </SvgText>
        </Svg>
      );
    }

    // For non-math content, return null to let parent handle rendering
    return null;
  };

  const result = renderExpression(expression);
  if (result === null) {
    return null;
  }

  return (
    <View style={[{ backgroundColor: 'transparent' }, style]}>
      {result}
    </View>
  );
};