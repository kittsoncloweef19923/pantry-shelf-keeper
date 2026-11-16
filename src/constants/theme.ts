/**
 * WARM_EARTHY preset (design-system) with the brief's required overrides:
 * cool canvas #EDF0F6, blue #2A4CAB, gold #E0B128, ink #181B24, lavender #BAB0DD.
 * The preset `name` stays exactly as in preset.ts.
 */

export const theme = {
  name: 'warm-earthy',

  colors: {
    // canvas + paper materials
    canvas: '#EDF0F6',
    paper: '#FAF5EC',
    woodLight: '#F2EAD8',
    woodMid: '#E8DDC4',
    woodEdge: '#D8C9A8',

    // brand
    blue: '#2A4CAB',
    blueDeep: '#1B3178',
    gold: '#E0B128',
    goldSoft: '#F0D48A',
    lavender: '#BAB0DD',

    // botanical / status
    herb: '#7FA46B',
    terracotta: '#D97B4D',
    mustard: '#D9B36C',
    walnut: '#6B5740',

    // text
    ink: '#181B24',
    inkSoft: 'rgba(24,27,36,0.74)',
    inkMuted: 'rgba(24,27,36,0.52)',
    cream: '#FAF5EC',
    creamSoft: 'rgba(250,245,236,0.82)',

    // lines + scrims
    border: '#D8C9A8',
    borderBlue: 'rgba(42,76,171,0.30)',
    divider: 'rgba(24,27,36,0.10)',
    scrim: 'rgba(24,27,36,0.30)',
    inkWash: 'rgba(24,27,36,0.92)',
  },

  // every screen shares bg_game and is told apart by its own overlay
  gradients: {
    loader: ['#181B24', '#22306B', '#2A4CAB'] as string[],
    menu: ['#EDF0F6', '#F4F2EE', '#FAF5EC'] as string[],
    game: ['#EDF0F6', '#EFEDE8', '#F2EAD8'] as string[],
    additem: ['#FAF5EC', '#F3F2F2', '#EDF0F6'] as string[],
    expiring: ['#EDF0F6', '#EAE9E6', '#E8DDC4'] as string[],
    shopping: ['#EDF0F6', '#F5F3F1', '#FAF5EC'] as string[],
    settings: ['#EDF0F6', '#D9D7E8', '#BAB0DD'] as string[],
    receipt: ['#FAF5EC', '#C9D3B2', '#7FA46B'] as string[],

    header: ['#2A4CAB', '#1B3178'] as string[],
    hub: ['#2A4CAB', '#243F8E'] as string[],
    cta: ['#E0B128', '#E8DDC4'] as string[],
    paper: ['#FAF5EC', '#F2EAD8'] as string[],
    wood: ['#F2EAD8', '#E8DDC4'] as string[],
  },

  // screen-level overlay coverage (Loader is the dark one)
  overlay: {
    loader: 0.93,
    menu: 0.94,
    game: 0.92,
    additem: 0.94,
    expiring: 0.93,
    shopping: 0.93,
    settings: 0.95,
    receipt: 0.9,
  },

  radius: { sm: 8, md: 14, lg: 16, xl: 18, pill: 999 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  shadows: {
    card: {
      shadowColor: '#181B24',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    raised: {
      shadowColor: '#181B24',
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 5 },
      elevation: 4,
    },
    cta: {
      shadowColor: '#E0B128',
      shadowOpacity: 0.34,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    header: {
      shadowColor: '#181B24',
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
