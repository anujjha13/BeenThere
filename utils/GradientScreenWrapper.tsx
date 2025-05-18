// src/components/GradientScreenWrapper.tsx
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';

const GradientScreenWrapper = ({ children }) => (
  <LinearGradient
    colors={['rgb(219, 238, 255)','rgb(209, 253, 228)']}
    style={styles.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientScreenWrapper;
