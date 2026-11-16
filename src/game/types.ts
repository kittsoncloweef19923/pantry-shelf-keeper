export type Unit = 'pieces' | 'packs' | 'jars' | 'cans' | 'bags' | 'bottles';

export type Shelf = {
  id: string;
  name: string;
  displayOrder: number;
};

export type PantryItem = {
  id: string;
  shelfId: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: Unit;
  /** Local calendar date YYYY-MM-DD, or null for an explicitly undated batch. */
  bestBefore: string | null;
  createdAt: number;
};

export type ShoppingEntry = {
  id: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
  createdAt: number;
};

export type Settings = {
  hapticsEnabled: boolean;
  expiringWindowDays: number;
  lastVisitedShelfId: string | null;
};

export type PantrySnapshot = {
  schemaVersion: 1;
  revision: number;
  shelves: Shelf[];
  items: PantryItem[];
  shopping: ShoppingEntry[];
  settings: Settings;
};

export type DateStatus = 'past' | 'today' | 'soon' | 'later' | 'none';

export type StockFilter = 'instock' | 'all' | 'outofstock';
export type SortMode = 'bestbefore' | 'name' | 'recent';

export type ReceiptKind = 'add' | 'edit' | 'use';

export type Receipt = {
  mutationId: string;
  kind: ReceiptKind;
  itemId: string;
  itemName: string;
  shelfId: string;
  shelfName: string;
  unit: Unit;
  beforeQuantity: number;
  afterQuantity: number;
  usedAmount: number;
  bestBefore: string | null;
  /** Where the action started, so the receipt can return there. */
  origin: 'game' | 'expiring' | 'additem';
  shoppingAdded: boolean;
};
