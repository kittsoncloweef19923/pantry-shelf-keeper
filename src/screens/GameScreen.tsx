import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ListPlus,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react-native';

import { assets } from '../assets';
import { ActionSheet, SheetAction } from '../components/ActionSheet';
import { AppFrame } from '../components/AppFrame';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { ItemRow } from '../components/ItemRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { FRAME_MAX_W, FRAME_PAD, GUTTER } from '../constants/config';
import { theme } from '../constants/theme';
import {
  applyQuery,
  applyStockFilter,
  itemsOnShelf,
  positiveBatchCount,
  shelfName as resolveShelfName,
  sortItems,
} from '../game/inventorySelectors';
import type { PantryItem, PantrySnapshot, StockFilter } from '../game/types';

type Props = {
  snapshot: PantrySnapshot;
  today: string;
  shelfId: string;
  onBack: () => void;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onUseOne: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onSendToShopping: (itemId: string) => void;
};

const FILTERS: Array<{ id: StockFilter; label: string }> = [
  { id: 'instock', label: 'In stock' },
  { id: 'all', label: 'All' },
  { id: 'outofstock', label: 'Used up' },
];

const ITEM_ACTIONS: SheetAction[] = [
  { id: 'edit', label: 'Edit item', Icon: Pencil },
  { id: 'shopping', label: 'Add to shopping list', Icon: ListPlus },
  { id: 'delete', label: 'Delete item', Icon: Trash2, destructive: true },
];

export function GameScreen({
  snapshot,
  today,
  shelfId,
  onBack,
  onAddItem,
  onEditItem,
  onUseOne,
  onDeleteItem,
  onSendToShopping,
}: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StockFilter>('instock');
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const shelfLabel = resolveShelfName(snapshot.shelves, shelfId);
  const stockCount = positiveBatchCount(snapshot.items, shelfId);

  const visible = useMemo(() => {
    const onShelf = itemsOnShelf(snapshot.items, shelfId);
    return sortItems(applyQuery(applyStockFilter(onShelf, filter), query), 'bestbefore');
  }, [snapshot.items, shelfId, filter, query]);

  const menuItem = useMemo(
    () => (menuItemId ? snapshot.items.find(it => it.id === menuItemId) || null : null),
    [menuItemId, snapshot.items],
  );

  const openMenu = useCallback((itemId: string) => setMenuItemId(itemId), []);
  const closeMenu = useCallback(() => setMenuItemId(null), []);
  const clearQuery = useCallback(() => setQuery(''), []);

  const handleMenuAction = useCallback(
    (actionId: string) => {
      const id = menuItemId;
      setMenuItemId(null);
      if (!id) {
        return;
      }
      if (actionId === 'edit') {
        onEditItem(id);
      } else if (actionId === 'shopping') {
        onSendToShopping(id);
      } else if (actionId === 'delete') {
        onDeleteItem(id);
      }
    },
    [menuItemId, onEditItem, onSendToShopping, onDeleteItem],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PantryItem>) => (
      <ItemRow
        id={item.id}
        name={item.name}
        quantity={item.quantity}
        unit={item.unit}
        bestBefore={item.bestBefore}
        today={today}
        onUseOne={onUseOne}
        onMore={openMenu}
      />
    ),
    [today, onUseOne, openMenu],
  );

  const keyExtractor = useCallback((item: PantryItem) => item.id, []);

  const empty =
    query.length > 0 ? (
      <EmptyState
        illustration={assets.jar}
        title="No matching items"
        message="Nothing on this shelf matches that name."
        actionLabel="CLEAR SEARCH"
        onAction={clearQuery}
      />
    ) : filter === 'outofstock' ? (
      <EmptyState
        illustration={assets.shelf}
        title="Nothing used up here yet"
        message="Batches you finish will stay listed under Used up."
      />
    ) : (
      <EmptyState
        illustration={assets.jar}
        title="This shelf has room"
        message="Add your first pantry item."
        actionLabel="ADD ITEM"
        onAction={onAddItem}
      />
    );

  return (
    <AppFrame variant="game">
      <ScreenHeader
        title={shelfLabel}
        subtitle={stockCount > 0 ? `${stockCount} items in stock` : 'Shelf is empty'}
        leftSlot={<IconButton Icon={ArrowLeft} label="Back to shelves" onPress={onBack} />}
        rightSlot={<IconButton Icon={PackagePlus} label="Add item to this shelf" onPress={onAddItem} />}
      />

      <View style={styles.body}>
        <View style={styles.searchRow}>
          <Search size={20} color={theme.colors.inkMuted} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search this shelf"
            placeholderTextColor={theme.colors.inkMuted}
            style={styles.searchInput}
            accessibilityLabel="Search items on this shelf"
            returnKeyType="search"
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map(entry => (
            <Chip
              key={entry.id}
              label={entry.label}
              selected={filter === entry.id}
              onPress={() => setFilter(entry.id)}
            />
          ))}
        </View>

        <View style={styles.frame}>
          <LinearGradient
            colors={theme.gradients.wood}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.frameFill}>
            {visible.length > 0 ? (
              <FlatList
                data={visible}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                windowSize={5}
                initialNumToRender={5}
              />
            ) : (
              empty
            )}
          </LinearGradient>
        </View>
      </View>

      <LinearGradient
        colors={theme.gradients.wood}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.controls}>
        <Text style={styles.hint}>{`USE 1 LOGS A UNIT FROM ${shelfLabel.toUpperCase()}`}</Text>
        <View style={styles.controlsAction}>
          <PrimaryButton label="ADD ITEM" Icon={PackagePlus} onPress={onAddItem} />
        </View>
      </LinearGradient>

      <ActionSheet
        visible={menuItem !== null}
        title={menuItem ? menuItem.name : ''}
        message={menuItem ? `${menuItem.quantity} ${menuItem.unit} on ${shelfLabel}` : undefined}
        actions={ITEM_ACTIONS}
        onSelect={handleMenuAction}
        onDismiss={closeMenu}
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
  searchRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.paper,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    padding: 0,
    color: theme.colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  frame: {
    flex: 1,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  frameFill: {
    flex: 1,
    padding: FRAME_PAD,
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 4,
  },
  controls: {
    minHeight: 96,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.walnut,
    marginBottom: 10,
    textAlign: 'center',
  },
  controlsAction: {
    width: '100%',
  },
});
