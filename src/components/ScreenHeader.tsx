import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { HEADER_MIN_H, HEADER_TOP_PAD } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

/** The one header every screen uses, so padding and type never drift apart. */
function ScreenHeaderBase({ title, subtitle, leftSlot, rightSlot }: Props) {
  return (
    <LinearGradient
      colors={theme.gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.slot}>{leftSlot}</View>
        <View style={styles.center}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.slot}>{rightSlot}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: HEADER_TOP_PAD,
    minHeight: HEADER_MIN_H + HEADER_TOP_PAD,
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lavender,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.colors.cream,
    fontFamily: 'serif',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: theme.colors.creamSoft,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
