import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';

import { TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

/** Checked state is carried by the box and the strikethrough, never by colour alone. */
function ShoppingEntryRowBase({ id, name, quantity, unit, checked, onToggle, onRemove }: Props) {
  const handleToggle = useCallback(() => onToggle(id), [onToggle, id]);
  const handleRemove = useCallback(() => onRemove(id), [onRemove, id]);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${name}, ${checked ? 'bought' : 'still to buy'}`}
        style={styles.checkPress}>
        <View style={[styles.box, checked ? styles.boxOn : null]}>
          {checked ? <Check size={18} color={theme.colors.cream} strokeWidth={3} /> : null}
        </View>
      </Pressable>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.name, checked ? styles.nameChecked : null]}>
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {`${quantity} ${unit}`}
        </Text>
      </View>

      <Pressable
        onPress={handleRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${name}`}
        style={styles.removePress}>
        <Trash2 size={20} color={theme.colors.terracotta} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    ...theme.shadows.card,
  },
  checkPress: {
    width: TAP_MIN,
    height: TAP_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: theme.colors.herb,
    borderColor: theme.colors.herb,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  nameChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.inkMuted,
  },
  meta: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  removePress: {
    width: TAP_MIN,
    height: TAP_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ShoppingEntryRow = memo(ShoppingEntryRowBase);
