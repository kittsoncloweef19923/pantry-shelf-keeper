import { useCallback, useMemo, useRef, useState } from 'react';
import { Vibration } from 'react-native';

import { HAPTIC_MS } from '../constants/config';
import * as actions from '../game/pantryActions';
import type { Draft } from '../game/pantryActions';
import { todayISO } from '../game/dateMath';
import type { PantrySnapshot, Receipt, Settings, Unit } from '../game/types';

/**
 * One pantry store for every screen. Mutations are serialized through a ref
 * lock so a double tap can never commit the same change twice.
 */
export function usePantry() {
  const [snapshot, setSnapshot] = useState<PantrySnapshot>(actions.createInitialSnapshot);
  const writing = useRef(false);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const commit = useCallback((next: PantrySnapshot) => {
    setSnapshot(next);
    snapshotRef.current = next;
  }, []);

  const tick = useCallback(() => {
    if (snapshotRef.current.settings.hapticsEnabled) {
      Vibration.vibrate(HAPTIC_MS);
    }
  }, []);

  const addItem = useCallback(
    (draft: Draft): Receipt | null => {
      if (writing.current) {
        return null;
      }
      writing.current = true;
      const result = actions.addItem(snapshotRef.current, draft);
      commit(result.next);
      tick();
      writing.current = false;
      return result.receipt;
    },
    [commit, tick],
  );

  const editItem = useCallback(
    (itemId: string, draft: Draft): Receipt | null => {
      if (writing.current) {
        return null;
      }
      writing.current = true;
      const result = actions.editItem(snapshotRef.current, itemId, draft);
      commit(result.next);
      tick();
      writing.current = false;
      return result.receipt;
    },
    [commit, tick],
  );

  const useAmount = useCallback(
    (itemId: string, amount: number, origin: Receipt['origin']): Receipt | null => {
      if (writing.current) {
        return null;
      }
      writing.current = true;
      const result = actions.useAmount(snapshotRef.current, itemId, amount, origin);
      if (result) {
        commit(result.next);
        tick();
      }
      writing.current = false;
      return result ? result.receipt : null;
    },
    [commit, tick],
  );

  const undoUse = useCallback(
    (receipt: Receipt): boolean => {
      const next = actions.undoUse(snapshotRef.current, receipt);
      if (!next) {
        return false;
      }
      commit(next);
      return true;
    },
    [commit],
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      commit(actions.deleteItem(snapshotRef.current, itemId));
    },
    [commit],
  );

  const addToShopping = useCallback(
    (name: string, quantity: number, unit: Unit): string | null => {
      const result = actions.addToShopping(snapshotRef.current, name, quantity, unit);
      if (result.error) {
        return result.error;
      }
      commit(result.next);
      tick();
      return null;
    },
    [commit, tick],
  );

  const toggleShopping = useCallback(
    (entryId: string) => {
      commit(actions.toggleShopping(snapshotRef.current, entryId));
      tick();
    },
    [commit, tick],
  );

  const removeShopping = useCallback(
    (entryId: string) => {
      commit(actions.removeShopping(snapshotRef.current, entryId));
    },
    [commit],
  );

  const clearBought = useCallback(() => {
    commit(actions.clearBought(snapshotRef.current));
  }, [commit]);

  const clearAllData = useCallback(() => {
    commit(actions.clearAllData(snapshotRef.current));
  }, [commit]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const current = snapshotRef.current;
      commit(actions.bump(current, { settings: { ...current.settings, ...patch } }));
    },
    [commit],
  );

  const today = useMemo(() => todayISO(), []);

  return {
    snapshot,
    today,
    addItem,
    editItem,
    useAmount,
    undoUse,
    deleteItem,
    addToShopping,
    toggleShopping,
    removeShopping,
    clearBought,
    clearAllData,
    updateSettings,
  };
}

export type Pantry = ReturnType<typeof usePantry>;
