import React, { memo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { SecondaryButton } from './SecondaryButton';

type Props = {
  illustration: ImageSourcePropType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Centred, useful empty surface — never an unstructured blank area. */
function EmptyStateBase({ illustration, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.plate}>
        <Image source={illustration} style={styles.art} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <SecondaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  plate: {
    width: 128,
    height: 128,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.paper,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.card,
  },
  art: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  message: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.inkSoft,
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
    width: 220,
  },
});

export const EmptyState = memo(EmptyStateBase);
