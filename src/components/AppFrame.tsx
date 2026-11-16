import React, { memo } from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { assets } from '../assets';
import { theme } from '../constants/theme';

export type ScreenVariant =
  | 'loader'
  | 'menu'
  | 'game'
  | 'additem'
  | 'expiring'
  | 'shopping'
  | 'settings'
  | 'receipt';

type Props = {
  variant: ScreenVariant;
  children: React.ReactNode;
};

/**
 * One shared background photograph for every screen; the screens are told
 * apart by their own gradient wash and coverage.
 */
function AppFrameBase({ variant, children }: Props) {
  const colors = theme.gradients[variant];
  const opacity = theme.overlay[variant];
  const dark = variant === 'loader';

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={dark ? 'light-content' : 'dark-content'}
      />
      <ImageBackground source={assets.bg} resizeMode="cover" style={styles.bg}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity }]}
        />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  bg: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export const AppFrame = memo(AppFrameBase);
