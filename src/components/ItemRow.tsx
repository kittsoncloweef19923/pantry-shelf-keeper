import React, { memo, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MoreVertical, Package } from 'lucide-react-native';

import { TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';
import { DateStatusLabel } from './DateStatusLabel';

type Props = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  bestBefore: string | null;
  today: string;
  /** Shown on the cross-shelf date list only. */
  shelfName?: string;
  highlighted?: boolean;
  onUseOne: (id: string) => void;
  onMore: (id: string) => void;
};

/**
 * Primitives only, so React.memo actually prevents re-renders while the list
 * scrolls. The row never keeps its own copy of the quantity.
 */
function ItemRowBase({
  id,
  name,
  quantity,
  unit,
  bestBefore,
  today,
  shelfName,
  highlighted = false,
  onUseOne,
  onMore,
}: Props) {
  const use = usePressFeedback(0.94);
  const handleUse = useCallback(() => onUseOne(id), [onUseOne, id]);
  const handleMore = useCallback(() => onMore(id), [onMore, id]);
  const outOfStock = quantity <= 0;

  return (
    <View style={[styles.card, highlighted ? styles.cardHighlight : null]}>
      <View style={styles.top}>
        <View style={styles.well}>
          <Package size={24} color={theme.colors.blue} strokeWidth={2} />
        </View>

        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.name}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.quantity}>
            {outOfStock ? `Out of stock · ${unit}` : `${quantity} ${unit}`}
            {shelfName ? ` · ${shelfName}` : ''}
          </Text>
          <DateStatusLabel bestBefore={bestBefore} today={today} />
        </View>

        <Pressable
          onPress={handleMore}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`More actions for ${name}`}
          style={styles.more}>
          <MoreVertical size={22} color={theme.colors.inkMuted} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={outOfStock ? undefined : handleUse}
          onPressIn={outOfStock ? undefined : use.onPressIn}
          onPressOut={outOfStock ? undefined : use.onPressOut}
          disabled={outOfStock}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Use one ${unit.replace(/s$/, '')} of ${name}`}
          accessibilityState={{ disabled: outOfStock }}
          style={styles.usePress}>
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.useVisual,
              outOfStock ? styles.useDisabled : null,
              { transform: [{ scale: use.scale }] },
            ]}>
            <Text style={[styles.useLabel, outOfStock ? styles.useLabelOff : null]}>USE 1</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    padding: 12,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  cardHighlight: {
    borderColor: theme.colors.gold,
    backgroundColor: '#FDF6E4',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  well: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(42,76,171,0.10)',
    borderWidth: 1,
    borderColor: theme.colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 2,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  quantity: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  more: {
    width: TAP_MIN,
    height: TAP_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  usePress: {
    width: 96,
    height: TAP_MIN,
    justifyContent: 'center',
  },
  useVisual: {
    width: '100%',
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderBlue,
    backgroundColor: 'rgba(42,76,171,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useDisabled: {
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(24,27,36,0.04)',
  },
  useLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.blue,
  },
  useLabelOff: {
    color: theme.colors.inkMuted,
  },
});

export const ItemRow = memo(ItemRowBase);
