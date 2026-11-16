import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarClock,
  LayoutGrid,
  Settings as SettingsIcon,
  ShoppingBasket,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { BOTTOM_NAV_H } from '../constants/config';
import { theme } from '../constants/theme';

export type Destination = 'menu' | 'expiring' | 'shopping' | 'settings';

type Props = {
  selected: Destination;
  onSelect: (destination: Destination) => void;
  dueCount: number;
  shoppingCount: number;
};

type Entry = { id: Destination; label: string; Icon: LucideIcon };

const ENTRIES: Entry[] = [
  { id: 'menu', label: 'Shelves', Icon: LayoutGrid },
  { id: 'expiring', label: 'Expiring', Icon: CalendarClock },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBasket },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

function NavItem({
  entry,
  selected,
  badge,
  onSelect,
}: {
  entry: Entry;
  selected: boolean;
  badge: number;
  onSelect: (destination: Destination) => void;
}) {
  const handlePress = useCallback(() => onSelect(entry.id), [onSelect, entry.id]);
  const color = selected ? theme.colors.blue : theme.colors.inkMuted;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={entry.label}
      style={styles.item}>
      <View style={[styles.inset, selected ? styles.insetOn : null]}>
        <entry.Icon size={24} color={color} strokeWidth={selected ? 2.4 : 1.9} />
        {badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99' : String(badge)}</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.label, { color }]}>
        {entry.label}
      </Text>
    </Pressable>
  );
}

function BottomNavigationBase({ selected, onSelect, dueCount, shoppingCount }: Props) {
  return (
    <LinearGradient
      colors={theme.gradients.wood}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.bar}>
      {ENTRIES.map(entry => (
        <NavItem
          key={entry.id}
          entry={entry}
          selected={entry.id === selected}
          badge={entry.id === 'expiring' ? dueCount : entry.id === 'shopping' ? shoppingCount : 0}
          onSelect={onSelect}
        />
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: BOTTOM_NAV_H + 12,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  item: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inset: {
    width: 56,
    height: 32,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insetOn: {
    backgroundColor: 'rgba(186,176,221,0.45)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: theme.colors.cream,
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});

export const BottomNavigation = memo(BottomNavigationBase);
