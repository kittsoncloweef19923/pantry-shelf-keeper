import React, { memo, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { STEPPER_SIZE } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  value: number;
  minimum: number;
  maximum: number;
  unitLabel: string;
  onChange: (next: number) => void;
};

function StepButton({
  Icon,
  label,
  disabled,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.92);

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
      style={styles.stepPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.stepVisual, disabled ? styles.stepOff : null, { transform: [{ scale }] }]}>
        <Icon
          size={24}
          color={disabled ? theme.colors.inkMuted : theme.colors.blue}
          strokeWidth={2.6}
        />
      </Animated.View>
    </Pressable>
  );
}

function QuantityStepperBase({ value, minimum, maximum, unitLabel, onChange }: Props) {
  const decrease = useCallback(() => onChange(Math.max(minimum, value - 1)), [onChange, value, minimum]);
  const increase = useCallback(() => onChange(Math.min(maximum, value + 1)), [onChange, value, maximum]);

  return (
    <View style={styles.row}>
      <StepButton Icon={Minus} label="Decrease quantity" disabled={value <= minimum} onPress={decrease} />
      <View style={styles.readout}>
        <Text style={styles.value}>{value}</Text>
        <Text numberOfLines={1} style={styles.unit}>
          {unitLabel}
        </Text>
      </View>
      <StepButton Icon={Plus} label="Increase quantity" disabled={value >= maximum} onPress={increase} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepPress: {
    width: STEPPER_SIZE,
    height: STEPPER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVisual: {
    width: STEPPER_SIZE,
    height: STEPPER_SIZE,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderBlue,
    backgroundColor: 'rgba(42,76,171,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepOff: {
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(24,27,36,0.04)',
  },
  readout: {
    flex: 1,
    minWidth: 80,
    height: STEPPER_SIZE,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.colors.ink,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.colors.inkMuted,
  },
});

export const QuantityStepper = memo(QuantityStepperBase);
