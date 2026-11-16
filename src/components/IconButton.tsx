import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { TAP_MIN } from '../constants/config';
import { usePressFeedback } from '../hooks/usePressFeedback';
import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  onPress: () => void;
  label: string;
  tone?: 'cream' | 'ink' | 'blue';
  filled?: boolean;
};

/** 48 x 48 icon-only target. Every instance is named for accessibility. */
function IconButtonBase({ Icon, onPress, label, tone = 'cream', filled = true }: Props) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.9);
  const color =
    tone === 'cream' ? theme.colors.cream : tone === 'blue' ? theme.colors.blue : theme.colors.ink;
  const bg =
    tone === 'cream' ? 'rgba(250,245,236,0.18)' : 'rgba(42,76,171,0.10)';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.visual,
          filled ? { backgroundColor: bg, borderColor: color + '44' } : styles.plain,
          { transform: [{ scale }] },
        ]}>
        <Icon size={22} color={color} strokeWidth={2} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: TAP_MIN,
    height: TAP_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

export const IconButton = memo(IconButtonBase);
