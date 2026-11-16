import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  value: string;
  label: string;
  tone: string;
};

/**
 * One shared pill for every screen. Vector icons only: an AI sprite inside a
 * 44 dp well never lines up with its neighbours. Render `null` instead of an
 * empty pill when there is no value to show.
 */
function StatCardBase({ Icon, value, label, tone }: Props) {
  if (!value) {
    return null;
  }
  return (
    <View style={[styles.card, { borderColor: tone + '55' }]}>
      <View style={[styles.iconWrap, { backgroundColor: tone + '1A' }]}>
        <Icon size={22} color={tone} strokeWidth={2.4} />
      </View>
      <Text numberOfLines={1} style={[styles.value, { color: tone }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width:'100%' and not flex:1 — a flex child of a flex:1 slot collapses.
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.paper,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.colors.inkMuted,
  },
});

export const StatCard = memo(StatCardBase);
