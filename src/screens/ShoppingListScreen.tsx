import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Eraser, ListPlus, Plus } from 'lucide-react-native';

import { assets } from '../assets';
import { AppFrame } from '../components/AppFrame';
import { BottomNavigation, Destination } from '../components/BottomNavigation';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { ShoppingEntryRow } from '../components/ShoppingEntryRow';
import { DEFAULT_UNIT, FRAME_MAX_W, GUTTER, NAME_MAX, TAP_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import type { PantrySnapshot, ShoppingEntry, Unit } from '../game/types';

type Props = {
  snapshot: PantrySnapshot;
  onAdd: (name: string, quantity: number, unit: Unit) => string | null;
  onToggle: (entryId: string) => void;
  onRemove: (entryId: string) => void;
  onClearBought: () => void;
  onNavigate: (destination: Destination) => void;
};

export function ShoppingListScreen({
  snapshot,
  onAdd,
  onToggle,
  onRemove,
  onClearBought,
  onNavigate,
}: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const open = snapshot.shopping.filter(e => !e.checked).sort((a, b) => a.createdAt - b.createdAt);
    const bought = snapshot.shopping.filter(e => e.checked).sort((a, b) => a.createdAt - b.createdAt);
    return open.concat(bought);
  }, [snapshot.shopping]);

  const openCount = useMemo(
    () => snapshot.shopping.filter(e => !e.checked).length,
    [snapshot.shopping],
  );
  const boughtCount = snapshot.shopping.length - openCount;

  const submit = useCallback(() => {
    const name = draft.trim();
    if (!name) {
      setError('Type a name first.');
      return;
    }
    const failure = onAdd(name, 1, DEFAULT_UNIT);
    setError(failure);
    if (!failure) {
      setDraft('');
    }
  }, [draft, onAdd]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShoppingEntry>) => (
      <ShoppingEntryRow
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        checked={item.checked}
        onToggle={onToggle}
        onRemove={onRemove}
      />
    ),
    [onToggle, onRemove],
  );

  const keyExtractor = useCallback((entry: ShoppingEntry) => entry.id, []);

  return (
    <AppFrame variant="shopping">
      <ScreenHeader
        title="Shopping List"
        subtitle={openCount > 0 ? `${openCount} left to buy` : 'Ready for your next shop'}
      />

      <View style={styles.body}>
        <View style={styles.quickAdd}>
          <Image source={assets.bag} style={styles.quickArt} resizeMode="contain" />
          <View style={styles.quickRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              placeholder="Add an essential"
              placeholderTextColor={theme.colors.inkMuted}
              maxLength={NAME_MAX}
              returnKeyType="done"
              style={styles.quickInput}
              accessibilityLabel="Shopping entry name"
            />
            <Pressable
              onPress={submit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Add to shopping list"
              style={styles.quickPlus}>
              <View style={styles.quickPlusVisual}>
                <Plus size={24} color={theme.colors.ink} strokeWidth={2.6} />
              </View>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {ordered.length > 0 ? (
          <FlatList
            data={ordered}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            windowSize={5}
          />
        ) : (
          <EmptyState
            illustration={assets.bag}
            title="Your shopping list is clear"
            message="Add essentials here or send a used item over from a shelf."
          />
        )}
      </View>

      <LinearGradient
        colors={theme.gradients.wood}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.controls}>
        <Text style={styles.hint}>
          {boughtCount > 0 ? `${boughtCount} BOUGHT · TAP A BOX TO CHECK OFF` : 'TAP A BOX WHEN YOU BUY IT'}
        </Text>
        <PrimaryButton label="ADD SHOPPING ITEM" Icon={ListPlus} onPress={submit} />
        {boughtCount > 0 ? (
          <View style={styles.secondary}>
            <SecondaryButton label="CLEAR BOUGHT" Icon={Eraser} onPress={onClearBought} />
          </View>
        ) : null}
      </LinearGradient>

      <BottomNavigation
        selected="shopping"
        onSelect={onNavigate}
        dueCount={0}
        shoppingCount={openCount}
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
  quickAdd: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    padding: 12,
    ...theme.shadows.card,
  },
  quickArt: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 44,
    height: 44,
    opacity: 0.25,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickInput: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.woodLight,
    paddingHorizontal: 14,
    fontSize: 16,
    color: theme.colors.ink,
  },
  quickPlus: {
    width: TAP_MIN,
    height: TAP_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPlusVisual: {
    width: TAP_MIN,
    height: TAP_MIN,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.terracotta,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 8,
  },
  controls: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: theme.colors.walnut,
    marginBottom: 10,
  },
  secondary: {
    marginTop: 10,
  },
});
