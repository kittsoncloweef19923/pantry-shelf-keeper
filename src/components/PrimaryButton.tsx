import React, { memo } from 'react';
import { Animated, DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';

import { ACTION_H } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  width?: DimensionValue;
  height?: number;
  accessibilityHint?: string;
};

/**
 * Gold material action. The Pressable is the parent and the animated visual
 * sits inside it, which is the only press pattern that survives an Android
 * release build.
 */
function PrimaryButtonBase({
  label,
  onPress,
  Icon,
  disabled = false,
  width = '100%',
  height = ACTION_H,
  accessibilityHint,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.98);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[styles.press, { width, height }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.visual, { transform: [{ scale }] }, disabled ? styles.muted : theme.shadows.cta]}>
        <LinearGradient
          colors={disabled ? ['#E6DDC2', '#DED6C0'] : theme.gradients.cta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}>
          <View style={styles.row}>
            {Icon ? (
              <View style={styles.iconBox}>
                <Icon size={24} color={theme.colors.ink} strokeWidth={2.2} />
              </View>
            ) : null}
            <Text numberOfLines={1} style={[styles.label, disabled ? styles.labelMuted : null]}>
              {label}
            </Text>
          </View>
        </LinearGradient>
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
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(24,27,36,0.10)',
  },
  muted: {
    opacity: 0.72,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    letterSpacing: 1.1,
    color: theme.colors.ink,
  },
  labelMuted: {
    color: theme.colors.inkMuted,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
