/**
 * Pantry Shelf Keeper — screen state machine.
 *
 * App.tsx owns transitions, the selected shelf and the action receipt only.
 * Every pantry rule lives in src/game, reached through the usePantry hook.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AddItemScreen } from './src/screens/AddItemScreen';
import { ExpiringSoonScreen } from './src/screens/ExpiringSoonScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ShoppingListScreen } from './src/screens/ShoppingListScreen';
import type { Destination } from './src/components/BottomNavigation';
import { ANIM } from './src/constants/config';
import { theme } from './src/constants/theme';
import { positiveBatchCount } from './src/game/inventorySelectors';
import type { Draft } from './src/game/pantryActions';
import type { Receipt } from './src/game/types';
import { usePantry } from './src/hooks/usePantry';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'gameover'
  | 'additem'
  | 'expiring'
  | 'shopping'
  | 'settings';

function App(): React.JSX.Element {
  const pantry = usePantry();
  const { snapshot, today } = pantry;

  const [screen, setScreen] = useState<Screen>('loader');
  const [shelfId, setShelfId] = useState<string>(snapshot.shelves[0].id);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0);
    const animation = Animated.timing(fade, {
      toValue: 1,
      duration: ANIM.base,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [screen, fade]);

  // ---- navigation -------------------------------------------------------

  const openShelf = useCallback(
    (nextShelfId: string) => {
      setShelfId(nextShelfId);
      pantry.updateSettings({ lastVisitedShelfId: nextShelfId });
      setScreen('game');
    },
    [pantry],
  );

  const handleLoaderDone = useCallback(() => setScreen('menu'), []);

  const handleStart = useCallback(() => {
    const last = snapshot.settings.lastVisitedShelfId;
    const exists = last && snapshot.shelves.some(s => s.id === last);
    openShelf(exists && last ? last : snapshot.shelves[0].id);
  }, [snapshot.settings.lastVisitedShelfId, snapshot.shelves, openShelf]);

  const handleNavigate = useCallback((destination: Destination) => {
    setScreen(destination);
  }, []);

  const handleBackToMenu = useCallback(() => setScreen('menu'), []);

  // ---- mutations --------------------------------------------------------

  const commitUse = useCallback(
    (itemId: string, origin: Receipt['origin']) => {
      const result = pantry.useAmount(itemId, 1, origin);
      if (result) {
        setReceipt(result);
        setScreen('gameover');
      }
    },
    [pantry],
  );

  const handleUseFromShelf = useCallback(
    (itemId: string) => commitUse(itemId, 'game'),
    [commitUse],
  );

  const handleUseFromDates = useCallback(
    (itemId: string) => commitUse(itemId, 'expiring'),
    [commitUse],
  );

  const handleAddItem = useCallback(() => {
    setEditingItemId(null);
    setScreen('additem');
  }, []);

  const handleEditItem = useCallback((itemId: string) => {
    setEditingItemId(itemId);
    setScreen('additem');
  }, []);

  const handleSaveDraft = useCallback(
    (draft: Draft) => {
      const result = editingItemId
        ? pantry.editItem(editingItemId, draft)
        : pantry.addItem(draft);
      if (!result) {
        return;
      }
      setShelfId(draft.shelfId);
      setEditingItemId(null);
      setReceipt(result);
      setScreen('gameover');
    },
    [editingItemId, pantry],
  );

  const handleSendToShopping = useCallback(
    (itemId: string) => {
      const item = snapshot.items.find(it => it.id === itemId);
      if (item) {
        pantry.addToShopping(item.name, 1, item.unit);
      }
    },
    [snapshot.items, pantry],
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => pantry.deleteItem(itemId),
    [pantry],
  );

  // ---- receipt ----------------------------------------------------------

  const handleReceiptShopping = useCallback(() => {
    if (!receipt || receipt.shoppingAdded) {
      return;
    }
    const failure = pantry.addToShopping(receipt.itemName, receipt.usedAmount, receipt.unit);
    if (!failure) {
      setReceipt({ ...receipt, shoppingAdded: true });
    }
  }, [receipt, pantry]);

  const handleUndo = useCallback(() => {
    if (!receipt) {
      return;
    }
    pantry.undoUse(receipt);
    setReceipt(null);
    setScreen(receipt.origin === 'expiring' ? 'expiring' : 'game');
  }, [receipt, pantry]);

  const handleAgain = useCallback(() => {
    if (!receipt) {
      setScreen('menu');
      return;
    }
    if (receipt.origin === 'expiring') {
      setReceipt(null);
      setScreen('expiring');
      return;
    }
    setShelfId(receipt.shelfId);
    setReceipt(null);
    setScreen('game');
  }, [receipt]);

  const handleReceiptClose = useCallback(() => {
    setReceipt(null);
    setScreen('menu');
  }, []);

  // ---- settings ---------------------------------------------------------

  const handleWindowChange = useCallback(
    (days: number) => pantry.updateSettings({ expiringWindowDays: days }),
    [pantry],
  );

  const handleHapticsChange = useCallback(
    (enabled: boolean) => pantry.updateSettings({ hapticsEnabled: enabled }),
    [pantry],
  );

  const receiptShelfStock = useMemo(
    () => (receipt ? positiveBatchCount(snapshot.items, receipt.shelfId) : 0),
    [receipt, snapshot.items],
  );

  // ---- render -----------------------------------------------------------

  let content: React.JSX.Element;

  if (screen === 'loader') {
    content = <LoaderScreen onDone={handleLoaderDone} />;
  } else if (screen === 'game') {
    content = (
      <GameScreen
        snapshot={snapshot}
        today={today}
        shelfId={shelfId}
        onBack={handleBackToMenu}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onUseOne={handleUseFromShelf}
        onDeleteItem={handleDeleteItem}
        onSendToShopping={handleSendToShopping}
      />
    );
  } else if (screen === 'gameover' && receipt) {
    content = (
      <GameOverScreen
        receipt={receipt}
        shelfStockCount={receiptShelfStock}
        shoppingAdded={receipt.shoppingAdded}
        onAddToShopping={handleReceiptShopping}
        onUndo={handleUndo}
        onAgain={handleAgain}
        onShelves={handleReceiptClose}
        onClose={handleReceiptClose}
      />
    );
  } else if (screen === 'additem') {
    content = (
      <AddItemScreen
        snapshot={snapshot}
        today={today}
        shelfId={shelfId}
        editingItemId={editingItemId}
        onBack={handleBackToMenu}
        onSave={handleSaveDraft}
      />
    );
  } else if (screen === 'expiring') {
    content = (
      <ExpiringSoonScreen
        snapshot={snapshot}
        today={today}
        windowDays={snapshot.settings.expiringWindowDays}
        onWindowChange={handleWindowChange}
        onUseOne={handleUseFromDates}
        onOpenShelf={openShelf}
        onNavigate={handleNavigate}
      />
    );
  } else if (screen === 'shopping') {
    content = (
      <ShoppingListScreen
        snapshot={snapshot}
        onAdd={pantry.addToShopping}
        onToggle={pantry.toggleShopping}
        onRemove={pantry.removeShopping}
        onClearBought={pantry.clearBought}
        onNavigate={handleNavigate}
      />
    );
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        snapshot={snapshot}
        today={today}
        onWindowChange={handleWindowChange}
        onHapticsChange={handleHapticsChange}
        onClearData={pantry.clearAllData}
        onNavigate={handleNavigate}
      />
    );
  } else {
    content = (
      <MenuScreen
        snapshot={snapshot}
        today={today}
        onOpenShelf={openShelf}
        onStart={handleStart}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity: fade }]}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  fill: {
    flex: 1,
  },
});

export default App;
