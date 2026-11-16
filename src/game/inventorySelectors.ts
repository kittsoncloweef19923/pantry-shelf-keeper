import { daysUntil, statusOf } from './dateMath';
import type { PantryItem, Shelf, SortMode, StockFilter } from './types';

export function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function itemsOnShelf(items: PantryItem[], shelfId: string): PantryItem[] {
  return items.filter(it => it.shelfId === shelfId);
}

/** Batch records with stock, not the sum of jars and cans. */
export function positiveBatchCount(items: PantryItem[], shelfId: string): number {
  let n = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].shelfId === shelfId && items[i].quantity > 0) {
      n++;
    }
  }
  return n;
}

export function nearestDate(items: PantryItem[], shelfId: string): string | null {
  let best: string | null = null;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.shelfId !== shelfId || it.quantity <= 0 || !it.bestBefore) {
      continue;
    }
    if (best === null || it.bestBefore < best) {
      best = it.bestBefore;
    }
  }
  return best;
}

/** 7-day window plus everything already past its date. */
export function attentionCount(items: PantryItem[], today: string, shelfId?: string): number {
  let n = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.quantity <= 0 || !it.bestBefore) {
      continue;
    }
    if (shelfId && it.shelfId !== shelfId) {
      continue;
    }
    if (daysUntil(it.bestBefore, today) <= 7) {
      n++;
    }
  }
  return n;
}

export function dueWithin(items: PantryItem[], today: string, windowDays: number): PantryItem[] {
  return items.filter(
    it => it.quantity > 0 && it.bestBefore !== null && daysUntil(it.bestBefore, today) <= windowDays,
  );
}

export function applyStockFilter(items: PantryItem[], filter: StockFilter): PantryItem[] {
  if (filter === 'instock') {
    return items.filter(it => it.quantity > 0);
  }
  if (filter === 'outofstock') {
    return items.filter(it => it.quantity <= 0);
  }
  return items;
}

export function applyQuery(items: PantryItem[], query: string): PantryItem[] {
  const q = normalize(query);
  if (!q) {
    return items;
  }
  return items.filter(it => it.normalizedName.indexOf(q) !== -1);
}

/**
 * Best before: dated stock by date ascending, undated stock by name,
 * zero-stock records last. Ties break on normalized name, then id.
 */
export function sortItems(items: PantryItem[], mode: SortMode): PantryItem[] {
  const copy = items.slice();
  copy.sort((a, b) => {
    if (mode === 'name') {
      return compareName(a, b);
    }
    if (mode === 'recent') {
      return b.createdAt - a.createdAt || compareName(a, b);
    }
    const aZero = a.quantity <= 0 ? 1 : 0;
    const bZero = b.quantity <= 0 ? 1 : 0;
    if (aZero !== bZero) {
      return aZero - bZero;
    }
    const aDated = a.bestBefore ? 0 : 1;
    const bDated = b.bestBefore ? 0 : 1;
    if (aDated !== bDated) {
      return aDated - bDated;
    }
    if (a.bestBefore && b.bestBefore && a.bestBefore !== b.bestBefore) {
      return a.bestBefore < b.bestBefore ? -1 : 1;
    }
    return compareName(a, b);
  });
  return copy;
}

function compareName(a: PantryItem, b: PantryItem): number {
  if (a.normalizedName !== b.normalizedName) {
    return a.normalizedName < b.normalizedName ? -1 : 1;
  }
  return a.id < b.id ? -1 : 1;
}

export type DateSection = { title: string; data: PantryItem[] };

/** Past best before / Today / Next N days. Empty sections are omitted. */
export function sectionsByDate(
  items: PantryItem[],
  today: string,
  windowDays: number,
): DateSection[] {
  const past: PantryItem[] = [];
  const now: PantryItem[] = [];
  const next: PantryItem[] = [];

  const due = dueWithin(items, today, windowDays);
  for (let i = 0; i < due.length; i++) {
    const s = statusOf(due[i].bestBefore, today);
    if (s === 'past') {
      past.push(due[i]);
    } else if (s === 'today') {
      now.push(due[i]);
    } else {
      next.push(due[i]);
    }
  }

  const byDate = (a: PantryItem, b: PantryItem) => {
    if (a.bestBefore && b.bestBefore && a.bestBefore !== b.bestBefore) {
      return a.bestBefore < b.bestBefore ? -1 : 1;
    }
    return compareName(a, b);
  };

  const out: DateSection[] = [];
  if (past.length) {
    out.push({ title: 'PAST BEST BEFORE', data: past.sort(byDate) });
  }
  if (now.length) {
    out.push({ title: 'TODAY', data: now.sort(byDate) });
  }
  if (next.length) {
    out.push({ title: `NEXT ${windowDays} DAYS`, data: next.sort(byDate) });
  }
  return out;
}

export function shelfName(shelves: Shelf[], shelfId: string): string {
  const found = shelves.find(s => s.id === shelfId);
  return found ? found.name : 'Shelf';
}
