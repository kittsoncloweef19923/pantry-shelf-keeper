import React, { memo } from 'react';
import { Animated, DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  width?: DimensionValue;
  height?: number;
  /** On a blue surface the label and border turn cream. */
  onBlue?: boolean;
};

/** Bordered 48 dp action. Same icon size and gap as PrimaryButton. */
function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  disabled = false,
  width = '100%',
  height = TAP_MIN,
  onBlue = false,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.97);
  const tint = onBlue ? theme.colors.cream : theme.colors.blue;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.press, { width, height }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.visual,
          {
            transform: [{ scale }],
            borderColor: onBlue ? 'rgba(250,245,236,0.55)' : theme.colors.borderBlue,
            backgroundColor: onBlue ? 'rgba(250,245,236,0.12)' : theme.colors.paper,
            opacity: disabled ? 0.6 : 1,
          },
        ]}>
        <View style={styles.row}>
          {Icon ? (
            <View style={styles.iconBox}>
              <Icon size={24} color={tint} strokeWidth={2} />
            </View>
          ) : null}
          <Text numberOfLines={1} style={[styles.label, { color: tint }]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  visual: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
