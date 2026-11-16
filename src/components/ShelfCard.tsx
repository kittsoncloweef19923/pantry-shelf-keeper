import React, { memo, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Boxes, ChevronRight } from 'lucide-react-native';

import { formatShort } from '../game/dateMath';
import { theme } from '../constants/theme';
import { usePressFeedback } from '../hooks/usePressFeedback';

type Props = {
  id: string;
  name: string;
  batchCount: number;
  nearestDate: string | null;
  attentionCount: number;
  onOpen: (id: string) => void;
};

function ShelfCardBase({ id, name, batchCount, nearestDate, attentionCount, onOpen }: Props) {
  const { scale, onPressIn, onPressOut } = usePressFeedback(0.98);
  const handlePress = useCallback(() => onOpen(id), [onOpen, id]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${batchCount} items in stock`}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.card, { transform: [{ scale }] }, theme.shadows.card]}>
        <LinearGradient
          colors={theme.gradients.paper}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.surface}>
          <View style={styles.well}>
            <Boxes size={26} color={theme.colors.blue} strokeWidth={2} />
          </View>

          <View style={styles.body}>
            <Text numberOfLines={1} style={styles.name}>
              {name}
            </Text>
            <Text numberOfLines={1} style={styles.count}>
              {batchCount > 0 ? `${batchCount} items in stock` : 'Ready for your first item'}
            </Text>
            {nearestDate ? (
              <Text numberOfLines={1} style={styles.nearest}>
                {`Next best before: ${formatShort(nearestDate)}`}
              </Text>
            ) : null}
          </View>

          <View style={styles.right}>
            {attentionCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{attentionCount}</Text>
              </View>
            ) : null}
            <ChevronRight size={22} color={theme.colors.inkMuted} strokeWidth={2} />
          </View>
        </LinearGradient>
        <View style={styles.lip} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: 116,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    backgroundColor: theme.colors.paper,
  },
  surface: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  well: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(42,76,171,0.10)',
    borderWidth: 1,
    borderColor: theme.colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.ink,
    fontFamily: 'serif',
  },
  count: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.colors.inkSoft,
  },
  nearest: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: theme.colors.walnut,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  badge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(224,177,40,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  lip: {
    height: 3,
    backgroundColor: theme.colors.woodEdge,
  },
});

export const ShelfCard = memo(ShelfCardBase);
