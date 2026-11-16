import React, { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';
import { Trash2, Vibrate } from 'lucide-react-native';

import { assets } from '../assets';
import { ActionSheet, SheetAction } from '../components/ActionSheet';
import { AppFrame } from '../components/AppFrame';
import { BottomNavigation, Destination } from '../components/BottomNavigation';
import { Chip } from '../components/Chip';
import { MaterialCard } from '../components/MaterialCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { FRAME_MAX_W, GUTTER, WINDOW_CHOICES } from '../constants/config';
import { theme } from '../constants/theme';
import { attentionCount } from '../game/inventorySelectors';
import type { PantrySnapshot } from '../game/types';

type Props = {
  snapshot: PantrySnapshot;
  today: string;
  onWindowChange: (days: number) => void;
  onHapticsChange: (enabled: boolean) => void;
  onClearData: () => void;
  onNavigate: (destination: Destination) => void;
};

const CLEAR_ACTIONS: SheetAction[] = [
  { id: 'clear', label: 'Clear everything', Icon: Trash2, destructive: true },
];

export function SettingsScreen({
  snapshot,
  today,
  onWindowChange,
  onHapticsChange,
  onClearData,
  onNavigate,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const settings = snapshot.settings;

  const dueCount = useMemo(
    () => attentionCount(snapshot.items, today),
    [snapshot.items, today],
  );
  const shoppingCount = useMemo(
    () => snapshot.shopping.filter(e => !e.checked).length,
    [snapshot.shopping],
  );

  const openConfirm = useCallback(() => setConfirming(true), []);
  const closeConfirm = useCallback(() => setConfirming(false), []);
  const confirmClear = useCallback(() => {
    setConfirming(false);
    onClearData();
  }, [onClearData]);

  return (
    <AppFrame variant="settings">
      <ScreenHeader title="Settings" subtitle="Your pantry, your rules" />

      <View style={styles.body}>
        <MaterialCard style={styles.card}>
          <Text style={styles.cardTitle}>Attention window</Text>
          <Text style={styles.cardCopy}>
            How far ahead Expiring Soon looks for approaching best-before dates.
          </Text>
          <View style={styles.chipRow}>
            {WINDOW_CHOICES.map(days => (
              <Chip
                key={days}
                label={`${days} days`}
                selected={settings.expiringWindowDays === days}
                onPress={() => onWindowChange(days)}
              />
            ))}
          </View>
        </MaterialCard>

        <MaterialCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchIcon}>
              <Vibrate size={22} color={theme.colors.blue} strokeWidth={2.2} />
            </View>
            <View style={styles.switchBody}>
              <Text style={styles.cardTitle}>Haptic feedback</Text>
              <Text style={styles.cardCopy}>A short tick after a saved change.</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={onHapticsChange}
              accessibilityLabel="Haptic feedback"
              trackColor={{ false: theme.colors.woodEdge, true: theme.colors.herb }}
              thumbColor={theme.colors.paper}
            />
          </View>
        </MaterialCard>

        <MaterialCard style={styles.card}>
          <Text style={styles.cardTitle}>Your data</Text>
          <Text style={styles.cardCopy}>
            Your pantry is stored on this device. Nothing is sent anywhere.
          </Text>
          <View style={styles.destructive}>
            <SecondaryButton label="CLEAR ALL PANTRY DATA" Icon={Trash2} onPress={openConfirm} />
          </View>
        </MaterialCard>

        <View style={styles.about}>
          <Image source={assets.iconHome} style={styles.aboutArt} resizeMode="contain" />
          <View style={styles.aboutBody}>
            <Text style={styles.aboutName}>Pantry Shelf Keeper</Text>
            <Text style={styles.aboutMeta}>com.pantryshelf.keeper</Text>
          </View>
        </View>
      </View>

      <BottomNavigation
        selected="settings"
        onSelect={onNavigate}
        dueCount={dueCount}
        shoppingCount={shoppingCount}
      />

      <ActionSheet
        visible={confirming}
        title="Clear your pantry?"
        message="Every item and shopping entry is removed. Your three shelves stay, empty. This cannot be undone."
        actions={CLEAR_ACTIONS}
        onSelect={confirmClear}
        onDismiss={closeConfirm}
      />
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: FRAME_MAX_W,
    alignSelf: 'center',
    paddingTop: GUTTER,
  },
  card: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  cardCopy: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.inkSoft,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(42,76,171,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBody: {
    flex: 1,
  },
  destructive: {
    marginTop: 12,
  },
  about: {
    marginTop: 'auto',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  aboutArt: {
    width: 40,
    height: 40,
    opacity: 0.9,
  },
  aboutBody: {
    flex: 1,
  },
  aboutName: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  aboutMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.inkMuted,
  },
});
