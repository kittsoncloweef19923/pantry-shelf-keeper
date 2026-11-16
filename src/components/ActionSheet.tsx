import React, { memo, useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';

import { TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';

export type SheetAction = {
  id: string;
  label: string;
  Icon: LucideIcon;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  actions: SheetAction[];
  onSelect: (id: string) => void;
  onDismiss: () => void;
};

function Row({ action, onSelect }: { action: SheetAction; onSelect: (id: string) => void }) {
  const handlePress = useCallback(() => onSelect(action.id), [onSelect, action.id]);
  const tint = action.destructive ? theme.colors.terracotta : theme.colors.blue;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint + '14' }]}>
        <action.Icon size={22} color={tint} strokeWidth={2.2} />
      </View>
      <Text style={[styles.rowLabel, action.destructive ? { color: tint } : null]}>
        {action.label}
      </Text>
    </Pressable>
  );
}

/** Raised material options sheet. Every row is a 48 dp target. */
function ActionSheetBase({ visible, title, message, actions, onSelect, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={onDismiss}
        />
        <LinearGradient
          colors={theme.gradients.paper}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.sheet}>
          <View style={styles.grip} />
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.list}>
            {actions.map(action => (
              <Row key={action.id} action={action} onSelect={onSelect} />
            ))}
          </View>
          <Pressable
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={styles.cancel}>
            <Text style={styles.cancelLabel}>CANCEL</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(24,27,36,0.48)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  grip: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.woodEdge,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.ink,
    fontFamily: 'serif',
  },
  message: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.inkSoft,
  },
  list: {
    marginTop: 10,
  },
  row: {
    height: TAP_MIN + 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  cancel: {
    marginTop: 12,
    height: TAP_MIN,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.blue,
  },
});

export const ActionSheet = memo(ActionSheetBase);
