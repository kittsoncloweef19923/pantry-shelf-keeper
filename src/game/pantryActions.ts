import { MAX_QUANTITY } from '../constants/config';
import { addDays, todayISO } from './dateMath';
import { normalize } from './inventorySelectors';
import type {
  PantryItem,
  PantrySnapshot,
  Receipt,
  ReceiptKind,
  ShoppingEntry,
  Unit,
} from './types';

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export type Draft = {
  name: string;
  shelfId: string;
  quantity: number;
  unit: Unit;
  bestBefore: string | null;
};

/**
 * Starter pantry. A fresh install keeps three named shelves; the batches below
 * give the shelves, date list and shopping list something real to show on the
 * very first run, with dates derived from today so they never go stale.
 */
export function createInitialSnapshot(): PantrySnapshot {
  const today = todayISO();
  const now = Date.now();

  const shelves = [
    { id: 'shelf_top', name: 'Top shelf', displayOrder: 0 },
    { id: 'shelf_middle', name: 'Middle shelf', displayOrder: 1 },
    { id: 'shelf_bottom', name: 'Bottom shelf', displayOrder: 2 },
  ];

  const seeds: Array<Draft & { offset: number }> = [
    { name: 'Chickpeas', shelfId: 'shelf_top', quantity: 3, unit: 'cans', bestBefore: addDays(today, 3), offset: 0 },
    { name: 'Olive oil', shelfId: 'shelf_top', quantity: 1, unit: 'bottles', bestBefore: addDays(today, 120), offset: 1 },
    { name: 'Basmati rice', shelfId: 'shelf_top', quantity: 2, unit: 'bags', bestBefore: addDays(today, 210), offset: 2 },
    { name: 'Tomato passata', shelfId: 'shelf_middle', quantity: 4, unit: 'jars', bestBefore: addDays(today, 1), offset: 3 },
    { name: 'Penne pasta', shelfId: 'shelf_middle', quantity: 2, unit: 'packs', bestBefore: addDays(today, -2), offset: 4 },
    { name: 'Forest honey', shelfId: 'shelf_middle', quantity: 1, unit: 'jars', bestBefore: null, offset: 5 },
    { name: 'Coffee beans', shelfId: 'shelf_bottom', quantity: 1, unit: 'bags', bestBefore: addDays(today, 12), offset: 6 },
    { name: 'Green lentils', shelfId: 'shelf_bottom', quantity: 2, unit: 'bags', bestBefore: addDays(today, 300), offset: 7 },
    { name: 'Baking soda', shelfId: 'shelf_bottom', quantity: 0, unit: 'packs', bestBefore: addDays(today, 60), offset: 8 },
  ];

  const items: PantryItem[] = seeds.map(seed => ({
    id: newId('item'),
    shelfId: seed.shelfId,
    name: seed.name,
    normalizedName: normalize(seed.name),
    quantity: seed.quantity,
    unit: seed.unit,
    bestBefore: seed.bestBefore,
    createdAt: now + seed.offset,
  }));

  const shopping: ShoppingEntry[] = [
    makeEntry('Oat milk', 2, 'bottles', false, now),
    makeEntry('Sea salt', 1, 'packs', false, now + 1),
    makeEntry('Paper towels', 1, 'packs', true, now + 2),
  ];

  return {
    schemaVersion: 1,
    revision: 1,
    shelves,
    items,
    shopping,
    settings: {
      hapticsEnabled: true,
      expiringWindowDays: 7,
      lastVisitedShelfId: 'shelf_top',
    },
  };
}

function makeEntry(
  name: string,
  quantity: number,
  unit: Unit,
  checked: boolean,
  createdAt: number,
): ShoppingEntry {
  return {
    id: newId('buy'),
    name,
    normalizedName: normalize(name),
    quantity,
    unit,
    checked,
    createdAt,
  };
}

export function makeShoppingEntry(name: string, quantity: number, unit: Unit): ShoppingEntry {
  return makeEntry(name, quantity, unit, false, Date.now());
}

export function bump(snapshot: PantrySnapshot, patch: Partial<PantrySnapshot>): PantrySnapshot {
  return { ...snapshot, ...patch, revision: snapshot.revision + 1 };
}

export function addItem(
  snapshot: PantrySnapshot,
  draft: Draft,
): { next: PantrySnapshot; receipt: Receipt } {
  const item: PantryItem = {
    id: newId('item'),
    shelfId: draft.shelfId,
    name: draft.name.trim(),
    normalizedName: normalize(draft.name),
    quantity: clampQty(draft.quantity),
    unit: draft.unit,
    bestBefore: draft.bestBefore,
    createdAt: Date.now(),
  };
  const next = bump(snapshot, { items: snapshot.items.concat(item) });
  return { next, receipt: buildReceipt(next, 'add', item, 0, item.quantity, 0, 'additem') };
}

export function editItem(
  snapshot: PantrySnapshot,
  itemId: string,
  draft: Draft,
): { next: PantrySnapshot; receipt: Receipt } {
  const before = snapshot.items.find(it => it.id === itemId);
  const beforeQty = before ? before.quantity : 0;
  const items = snapshot.items.map(it =>
    it.id === itemId
      ? {
          ...it,
          shelfId: draft.shelfId,
          name: draft.name.trim(),
          normalizedName: normalize(draft.name),
          quantity: clampQty(draft.quantity),
          unit: draft.unit,
          bestBefore: draft.bestBefore,
        }
      : it,
  );
  const next = bump(snapshot, { items });
  const after = items.find(it => it.id === itemId) as PantryItem;
  return { next, receipt: buildReceipt(next, 'edit', after, beforeQty, after.quantity, 0, 'additem') };
}

/** Subtract exactly `amount`; a quantity never goes below zero. */
export function useAmount(
  snapshot: PantrySnapshot,
  itemId: string,
  amount: number,
  origin: Receipt['origin'],
): { next: PantrySnapshot; receipt: Receipt } | null {
  const item = snapshot.items.find(it => it.id === itemId);
  if (!item || item.quantity <= 0) {
    return null;
  }
  const used = Math.max(1, Math.min(amount, item.quantity));
  const afterQty = item.quantity - used;
  const items = snapshot.items.map(it => (it.id === itemId ? { ...it, quantity: afterQty } : it));
  const next = bump(snapshot, { items });
  const after = items.find(it => it.id === itemId) as PantryItem;
  return { next, receipt: buildReceipt(next, 'use', after, item.quantity, afterQty, used, origin) };
}

/** Inverse of a use action: gives the units back. */
export function undoUse(snapshot: PantrySnapshot, receipt: Receipt): PantrySnapshot | null {
  const item = snapshot.items.find(it => it.id === receipt.itemId);
  if (!item || receipt.kind !== 'use') {
    return null;
  }
  const items = snapshot.items.map(it =>
    it.id === receipt.itemId ? { ...it, quantity: clampQty(it.quantity + receipt.usedAmount) } : it,
  );
  let shopping = snapshot.shopping;
  if (receipt.shoppingAdded) {
    shopping = reverseShopping(shopping, receipt);
  }
  return bump(snapshot, { items, shopping });
}

export function deleteItem(snapshot: PantrySnapshot, itemId: string): PantrySnapshot {
  return bump(snapshot, { items: snapshot.items.filter(it => it.id !== itemId) });
}

/**
 * Merge only into an unpurchased entry with the same normalized name and unit.
 * Never silently caps or wraps past the quantity limit.
 */
export function addToShopping(
  snapshot: PantrySnapshot,
  name: string,
  quantity: number,
  unit: Unit,
): { next: PantrySnapshot; error: string | null } {
  const key = normalize(name);
  const match = snapshot.shopping.find(
    e => !e.checked && e.normalizedName === key && e.unit === unit,
  );
  if (match) {
    if (match.quantity + quantity > MAX_QUANTITY) {
      return {
        next: snapshot,
        error: `That would pass ${MAX_QUANTITY} ${unit}. Add a smaller amount.`,
      };
    }
    const shopping = snapshot.shopping.map(e =>
      e.id === match.id ? { ...e, quantity: e.quantity + quantity } : e,
    );
    return { next: bump(snapshot, { shopping }), error: null };
  }
  const entry = makeShoppingEntry(name, clampQty(quantity), unit);
  return { next: bump(snapshot, { shopping: snapshot.shopping.concat(entry) }), error: null };
}

function reverseShopping(shopping: ShoppingEntry[], receipt: Receipt): ShoppingEntry[] {
  const key = normalize(receipt.itemName);
  const match = shopping.find(
    e => !e.checked && e.normalizedName === key && e.unit === receipt.unit,
  );
  if (!match) {
    return shopping;
  }
  const left = match.quantity - receipt.usedAmount;
  if (left <= 0) {
    return shopping.filter(e => e.id !== match.id);
  }
  return shopping.map(e => (e.id === match.id ? { ...e, quantity: left } : e));
}

export function toggleShopping(snapshot: PantrySnapshot, entryId: string): PantrySnapshot {
  const shopping = snapshot.shopping.map(e =>
    e.id === entryId ? { ...e, checked: !e.checked } : e,
  );
  return bump(snapshot, { shopping });
}

export function removeShopping(snapshot: PantrySnapshot, entryId: string): PantrySnapshot {
  return bump(snapshot, { shopping: snapshot.shopping.filter(e => e.id !== entryId) });
}

export function clearBought(snapshot: PantrySnapshot): PantrySnapshot {
  return bump(snapshot, { shopping: snapshot.shopping.filter(e => !e.checked) });
}

export function clearAllData(snapshot: PantrySnapshot): PantrySnapshot {
  return {
    schemaVersion: 1,
    revision: snapshot.revision + 1,
    shelves: snapshot.shelves,
    items: [],
    shopping: [],
    settings: { ...snapshot.settings, lastVisitedShelfId: snapshot.shelves[0].id },
  };
}

export function clampQty(n: number): number {
  if (!isFinite(n)) {
    return 0;
  }
  return Math.max(0, Math.min(MAX_QUANTITY, Math.round(n)));
}

function buildReceipt(
  snapshot: PantrySnapshot,
  kind: ReceiptKind,
  item: PantryItem,
  beforeQuantity: number,
  afterQuantity: number,
  usedAmount: number,
  origin: Receipt['origin'],
): Receipt {
  const shelf = snapshot.shelves.find(s => s.id === item.shelfId);
  return {
    mutationId: newId('mut'),
    kind,
    itemId: item.id,
    itemName: item.name,
    shelfId: item.shelfId,
    shelfName: shelf ? shelf.name : 'Shelf',
    unit: item.unit,
    beforeQuantity,
    afterQuantity,
    usedAmount,
    bestBefore: item.bestBefore,
    origin,
    shoppingAdded: false,
  };
}
