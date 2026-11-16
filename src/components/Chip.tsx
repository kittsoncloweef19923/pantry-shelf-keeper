import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  width?: number;
  /** Keeps the author's casing — used for shelf names and other free text. */
  compact?: boolean;
};

/** 40 dp visible chip inside a 48 dp touch container. */
function ChipBase({ label, selected, onPress, width, compact = false }: Props) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.96);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.press, width ? { width } : styles.pressGrow]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.visual,
          selected ? styles.visualOn : styles.visualOff,
          { transform: [{ scale }] },
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            compact ? styles.labelCompact : null,
            selected ? styles.labelOn : styles.labelOff,
          ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    height: TAP_MIN,
    justifyContent: 'center',
  },
  pressGrow: {
    flex: 1,
  },
  visual: {
    height: 40,
    width: '100%',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  visualOn: {
    backgroundColor: theme.colors.paper,
    borderColor: theme.colors.gold,
  },
  visualOff: {
    backgroundColor: 'rgba(250,245,236,0.55)',
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelCompact: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    textTransform: 'none',
  },
  labelOn: {
    color: theme.colors.blue,
  },
  labelOff: {
    color: theme.colors.inkSoft,
  },
});

export const Chip = memo(ChipBase);
