import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

interface HamburgerMenuProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  onPress, 
  color = 'white', 
  size = 24 
}) => {
  const barHeight = Math.max(2, size / 8);
  const barWidth = size;
  const barSpacing = Math.max(4, size / 6);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[
        styles.bar, 
        { backgroundColor: color, width: barWidth, height: barHeight, marginBottom: barSpacing }
      ]} />
      <View style={[
        styles.bar, 
        { backgroundColor: color, width: barWidth, height: barHeight, marginBottom: barSpacing }
      ]} />
      <View style={[
        styles.bar, 
        { backgroundColor: color, width: barWidth, height: barHeight }
      ]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 1,
  }
});

export default HamburgerMenu;
