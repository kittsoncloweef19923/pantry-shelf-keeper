import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

/** Branded splash length. Exactly 8000 ms — shorter values race the screenshot capture. */
export const LOADER_DURATION_MS = 8000;

/** Shared flex geometry. */
export const HEADER_TOP_PAD = 44;
export const HEADER_MIN_H = 72;
export const BOTTOM_NAV_H = 72;
export const GUTTER = 16;

/** G1 content frame: viewport minus gutters, capped, with its own padding + border known. */
export const FRAME_PAD = 8;
export const FRAME_BORDER = 1;
export const FRAME_MAX_W = Math.min(SCREEN_W - 2 * GUTTER, 380);
export const FRAME_INNER_W = FRAME_MAX_W - 2 * (FRAME_PAD + FRAME_BORDER);

/** Hub (M3 bento) split: 58% primary tile / 42% stacked navigation tiles. */
export const HUB_GAP = 12;
export const HUB_W = FRAME_MAX_W;
export const HUB_PRIMARY_W = Math.floor((HUB_W - HUB_GAP) * 0.58);
export const HUB_SECONDARY_W = HUB_W - HUB_GAP - HUB_PRIMARY_W;

/** Touch + control sizing. */
export const TAP_MIN = 48;
export const ACTION_H = 56;
export const STEPPER_SIZE = 56;

/** Domain limits. */
export const MIN_QUANTITY = 0;
export const MAX_QUANTITY = 999;
export const NAME_MAX = 80;
export const SHELF_NAME_MAX = 32;

export const UNITS = ['pieces', 'packs', 'jars', 'cans', 'bags', 'bottles'] as const;
export const DEFAULT_UNIT = 'pieces';

export const WINDOW_CHOICES = [7, 14, 30];
export const DEFAULT_WINDOW_DAYS = 7;

/** Quick best-before offsets, in days. Keeps the native date picker out of the bundle. */
export const DATE_PRESETS = [
  { label: '3 DAYS', days: 3 },
  { label: '1 WEEK', days: 7 },
  { label: '1 MONTH', days: 30 },
  { label: '6 MONTHS', days: 182 },
];

/** Motion. Standard transition is 180 ms; reduced motion falls back to a 100 ms fade. */
export const ANIM = {
  fast: 150,
  base: 180,
  slow: 220,
  stagger: 25,
  reduced: 100,
  pressIn: 80,
  spring: { tension: 180, friction: 20 },
  pressSpring: { tension: 300, friction: 14 },
};

export const HAPTIC_MS = 14;
export const UNDO_WINDOW_MS = 5000;
export const HIGHLIGHT_MS = 800;
