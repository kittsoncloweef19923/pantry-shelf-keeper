import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarOff, Clock, TriangleAlert } from 'lucide-react-native';

import { dateLabel, statusOf } from '../game/dateMath';
import type { DateStatus } from '../game/types';
import { theme } from '../constants/theme';

type Props = {
  bestBefore: string | null;
  today: string;
};

export function toneFor(status: DateStatus): string {
  if (status === 'past') {
    return theme.colors.terracotta;
  }
  if (status === 'today' || status === 'soon') {
    return theme.colors.gold;
  }
  if (status === 'none') {
    return theme.colors.inkMuted;
  }
  return theme.colors.herb;
}

/** Date meaning is always spelled out; colour never carries it alone. */
function DateStatusLabelBase({ bestBefore, today }: Props) {
  const status = statusOf(bestBefore, today);
  const tone = toneFor(status);
  const Icon =
    status === 'past'
      ? TriangleAlert
      : status === 'none'
      ? CalendarOff
      : Clock;

  return (
    <View style={styles.row}>
      <View style={[styles.marker, { backgroundColor: tone + '22' }]}>
        <Icon size={14} color={tone} strokeWidth={2.4} />
      </View>
      <Text numberOfLines={1} style={styles.text}>
        {dateLabel(bestBefore, today)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.colors.inkSoft,
  },
});

export const DateStatusLabel = memo(DateStatusLabelBase);
