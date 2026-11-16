import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { assets } from '../assets';
import { AppFrame } from '../components/AppFrame';
import { ANIM, LOADER_DURATION_MS } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  onDone: () => void;
};

const TRACK_W = 176;

/**
 * Branded splash. The pale hub that follows must look nothing like it, so the
 * shared background sits under an ink-to-blue wash here.
 */
export function LoaderScreen({ onDone }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const emblem = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    // width is a layout property, so this one value stays off the native driver
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    const entrance = Animated.parallel([
      Animated.timing(emblem, {
        toValue: 1,
        duration: ANIM.base,
        useNativeDriver: true,
      }),
      Animated.timing(title, {
        toValue: 1,
        duration: ANIM.base,
        delay: 40,
        useNativeDriver: true,
      }),
    ]);

    bar.start();
    entrance.start();
    const timer = setTimeout(() => done.current(), LOADER_DURATION_MS);

    return () => {
      bar.stop();
      entrance.stop();
      clearTimeout(timer);
    };
  }, [progress, emblem, title]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_W],
  });
  const emblemScale = emblem.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const titleShift = title.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <AppFrame variant="loader">
      <View style={styles.root}>
        <Image source={assets.herb} style={styles.herb} resizeMode="contain" />

        <Animated.View
          pointerEvents="box-none"
          style={[styles.plate, { opacity: emblem, transform: [{ scale: emblemScale }] }]}>
          <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.copy, { opacity: title, transform: [{ translateY: titleShift }] }]}>
          <Text style={styles.brand}>Pantry Shelf Keeper</Text>
          <Text style={styles.tagline}>Know your shelves. Waste less.</Text>
        </Animated.View>

        <View style={styles.progressBlock}>
          <View style={styles.track}>
            <Animated.View pointerEvents="none" style={[styles.fill, { width: fillWidth }]} />
          </View>
          <Text style={styles.caption}>LOADING… OPENING YOUR PANTRY</Text>
        </View>
      </View>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  herb: {
    position: 'absolute',
    right: 16,
    bottom: 48,
    width: 150,
    height: 150,
    opacity: 0.1,
  },
  plate: {
    width: 144,
    height: 144,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.paper,
    borderWidth: 1,
    borderColor: 'rgba(216,201,168,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.raised,
  },
  logo: {
    width: 112,
    height: 112,
  },
  copy: {
    marginTop: 28,
    alignItems: 'center',
  },
  brand: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: theme.colors.cream,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  tagline: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.creamSoft,
    textAlign: 'center',
  },
  progressBlock: {
    position: 'absolute',
    bottom: 72,
    alignItems: 'center',
  },
  track: {
    width: TRACK_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(186,176,221,0.25)',
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gold,
  },
  caption: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.creamSoft,
  },
});
