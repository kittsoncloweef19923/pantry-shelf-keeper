import React, { useCallback, useMemo } from 'react';
import { Image, SectionList, StyleSheet, Text, View } from 'react-native';

import { assets } from '../assets';
import { AppFrame } from '../components/AppFrame';
import { BottomNavigation, Destination } from '../components/BottomNavigation';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ItemRow } from '../components/ItemRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { FRAME_MAX_W, GUTTER, WINDOW_CHOICES } from '../constants/config';
import { theme } from '../constants/theme';
import { sectionsByDate, shelfName } from '../game/inventorySelectors';
import type { PantryItem, PantrySnapshot } from '../game/types';

type Props = {
  snapshot: PantrySnapshot;
  today: string;
  windowDays: number;
  onWindowChange: (days: number) => void;
  onUseOne: (itemId: string) => void;
  onOpenShelf: (shelfId: string) => void;
  onNavigate: (destination: Destination) => void;
};

export function ExpiringSoonScreen({
  snapshot,
  today,
  windowDays,
  onWindowChange,
  onUseOne,
  onOpenShelf,
  onNavigate,
}: Props) {
  const sections = useMemo(
    () => sectionsByDate(snapshot.items, today, windowDays),
    [snapshot.items, today, windowDays],
  );

  const total = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections],
  );

  const shoppingCount = useMemo(
    () => snapshot.shopping.filter(e => !e.checked).length,
    [snapshot.shopping],
  );

  const handleMore = useCallback(
    (itemId: string) => {
      const item = snapshot.items.find(it => it.id === itemId);
      if (item) {
        onOpenShelf(item.shelfId);
      }
    },
    [snapshot.items, onOpenShelf],
  );

  const handleShelves = useCallback(() => onNavigate('menu'), [onNavigate]);

  const renderItem = useCallback(
    ({ item }: { item: PantryItem }) => (
      <ItemRow
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        bestBefore={item.bestBefore}
        today={today}
        shelfName={shelfName(snapshot.shelves, item.shelfId)}
        onUseOne={onUseOne}
        onMore={handleMore}
      />
    ),
    [today, snapshot.shelves, onUseOne, handleMore],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <Text style={styles.sectionHeader}>{section.title}</Text>
    ),
    [],
  );

  const keyExtractor = useCallback((item: PantryItem) => item.id, []);

  return (
    <AppFrame variant="expiring">
      <ScreenHeader title="Expiring Soon" subtitle="Plan with what you have" />

      <View style={styles.body}>
        <View style={styles.summary}>
          <Image source={assets.dated} style={styles.summaryArt} resizeMode="contain" />
          <Text style={styles.summaryKicker}>ATTENTION WINDOW</Text>
          <Text style={styles.summaryHeadline}>
            {total > 0
              ? `${total} ${total === 1 ? 'batch needs' : 'batches need'} a look`
              : 'No dates due'}
          </Text>
          <View style={styles.windowRow}>
            {WINDOW_CHOICES.map(days => (
              <Chip
                key={days}
                label={`${days} days`}
                selected={windowDays === days}
                onPress={() => onWindowChange(days)}
              />
            ))}
          </View>
        </View>

        {total > 0 ? (
          <SectionList
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            windowSize={5}
          />
        ) : (
          <EmptyState
            illustration={assets.dated}
            title={`Nothing due in the next ${windowDays} days`}
            message="Check your shelves or add dates to more items."
            actionLabel="CHECK SHELVES"
            onAction={handleShelves}
          />
        )}
      </View>

      <BottomNavigation
        selected="expiring"
        onSelect={onNavigate}
        dueCount={total}
        shoppingCount={shoppingCount}
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
  summary: {
    borderRadius: theme.radius.lg,
    borderTopWidth: 3,
    borderTopColor: theme.colors.gold,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
    padding: 14,
    ...theme.shadows.card,
  },
  summaryArt: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 56,
    height: 56,
    opacity: 0.9,
  },
  summaryKicker: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.walnut,
  },
  summaryHeadline: {
    marginTop: 2,
    paddingRight: 64,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.ink,
    fontFamily: 'serif',
  },
  windowRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 12,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.walnut,
  },
});
