import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Boxes, Check, LayoutGrid, ListPlus, PackageCheck, Undo2, X } from 'lucide-react-native';

import { AppFrame } from '../components/AppFrame';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatCard } from '../components/StatCard';
import { ANIM, FRAME_MAX_W, GUTTER, UNDO_WINDOW_MS } from '../constants/config';
import { theme } from '../constants/theme';
import { formatFull } from '../game/dateMath';
import type { Receipt } from '../game/types';

type Props = {
  receipt: Receipt;
  /** Batches still in stock on the shelf the action touched. */
  shelfStockCount: number;
  shoppingAdded: boolean;
  onAddToShopping: () => void;
  onUndo: () => void;
  onAgain: () => void;
  onShelves: () => void;
  onClose: () => void;
};

export function GameOverScreen({
  receipt,
  shelfStockCount,
  shoppingAdded,
  onAddToShopping,
  onUndo,
  onAgain,
  onShelves,
  onClose,
}: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const [undoOpen, setUndoOpen] = useState(receipt.kind === 'use');

  useEffect(() => {
    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: ANIM.base,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [enter]);

  useEffect(() => {
    if (receipt.kind !== 'use') {
      return;
    }
    setUndoOpen(true);
    const timer = setTimeout(() => setUndoOpen(false), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [receipt.mutationId, receipt.kind]);

  const handleUndo = useCallback(() => {
    setUndoOpen(false);
    onUndo();
  }, [onUndo]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });

  const headline =
    receipt.kind === 'add'
      ? 'Item added'
      : receipt.kind === 'edit'
      ? 'Item updated'
      : `Used ${receipt.usedAmount} ${receipt.unit}`;

  const pills = [
    { key: 'left', Icon: Boxes, value: receipt.afterQuantity, label: 'left', tone: theme.colors.herb },
    {
      key: 'shelf',
      Icon: PackageCheck,
      value: shelfStockCount,
      label: 'on shelf',
      tone: theme.colors.blue,
    },
    {
      key: 'moved',
      Icon: ListPlus,
      value: receipt.kind === 'use' ? receipt.usedAmount : receipt.afterQuantity,
      label: receipt.kind === 'use' ? 'used' : 'added',
      tone: theme.colors.gold,
    },
  ].filter(pill => pill.value > 0);

  return (
    <AppFrame variant="receipt">
      <ScreenHeader
        title="Pantry updated"
        leftSlot={<IconButton Icon={X} label="Close receipt" onPress={onClose} />}
      />

      <View style={styles.body}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.center, { opacity: enter, transform: [{ scale }] }]}>
          <View style={styles.tab} />

          <LinearGradient
            colors={theme.gradients.paper}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.receipt}>
            <View style={styles.checkCircle}>
              <Check size={28} color={theme.colors.cream} strokeWidth={3} />
            </View>

            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.itemName}>{receipt.itemName}</Text>

            <View style={styles.detail}>
              <Text style={styles.detailLine}>{`Shelf: ${receipt.shelfName}`}</Text>
              <Text style={styles.detailLine}>
                {receipt.afterQuantity > 0
                  ? `Now ${receipt.afterQuantity} ${receipt.unit} left`
                  : 'Out of stock on this shelf'}
              </Text>
              <Text style={styles.detailLine}>
                {receipt.bestBefore
                  ? `Best before ${formatFull(receipt.bestBefore)}`
                  : 'No best-before date'}
              </Text>
            </View>

            {pills.length >= 2 ? (
              <View style={styles.pills}>
                {pills.map(pill => (
                  <View key={pill.key} style={styles.pillSlot}>
                    <StatCard
                      Icon={pill.Icon}
                      value={String(pill.value)}
                      label={pill.label}
                      tone={pill.tone}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>

        <View style={styles.actions}>
          {receipt.kind === 'use' ? (
            <View style={styles.actionBlock}>
              <SecondaryButton
                label={shoppingAdded ? 'ADDED TO SHOPPING LIST' : 'ADD TO SHOPPING LIST'}
                Icon={shoppingAdded ? Check : ListPlus}
                onPress={onAddToShopping}
                disabled={shoppingAdded}
              />
            </View>
          ) : null}

          {undoOpen ? (
            <View style={styles.actionBlock}>
              <SecondaryButton label="UNDO THIS USE" Icon={Undo2} onPress={handleUndo} />
            </View>
          ) : null}

          <Text style={styles.hint}>SAVED ON THIS DEVICE</Text>
          <PrimaryButton label="CHECK SHELF AGAIN" Icon={Boxes} onPress={onAgain} />
          <View style={styles.actionBlock}>
            <SecondaryButton label="ALL SHELVES" Icon={LayoutGrid} onPress={onShelves} />
          </View>
        </View>
      </View>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: FRAME_MAX_W,
    alignSelf: 'center',
    paddingTop: GUTTER,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    width: 96,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: theme.colors.gold,
  },
  receipt: {
    width: '100%',
    maxWidth: 348,
    minHeight: 264,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    alignItems: 'center',
    ...theme.shadows.raised,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    marginTop: 12,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  itemName: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.blue,
    textAlign: 'center',
  },
  detail: {
    marginTop: 10,
    alignItems: 'center',
  },
  detailLine: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.inkSoft,
    textAlign: 'center',
  },
  pills: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  pillSlot: {
    flex: 1,
  },
  actions: {
    paddingTop: 4,
  },
  actionBlock: {
    marginTop: 10,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: theme.colors.walnut,
    marginTop: 10,
    marginBottom: 8,
  },
});
