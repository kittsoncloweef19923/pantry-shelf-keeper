import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { ANIM } from '../constants/config';

/**
 * Press feedback for a Pressable PARENT: the Animated.View lives INSIDE the
 * Pressable, so the native-driver transform never swallows the touch on
 * Android release builds.
 */
export function usePressFeedback(to: number = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      tension: ANIM.pressSpring.tension,
      friction: ANIM.pressSpring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIM.spring.tension,
      friction: ANIM.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

/** Opacity + lift entrance used by screens, cards and sheets. */
export function useEnterAnimation(delay: number = 0, lift: number = 8) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: ANIM.base,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [lift, 0],
  });

  return { opacity: progress, translateY };
}
