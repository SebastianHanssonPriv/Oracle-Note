// Design tokens for the Bufab design system, transcribed from
// project/tokens.json and project/components/bundle.css in the Bufab
// Design System artifact (https://claude.ai/artifact/Wzve6rDQZegrNS5hyWzSgC).
//
// Light theme only — this app has no dark-mode infrastructure yet. Bufab's
// tokens.json defines a full dark theme too (see color.tokens[].value.dark);
// wiring that up later means adding a useColorScheme()-driven variant of
// this file, not redesigning anything.

export const color = {
  bg: {
    canvas: '#f9fafb',
    surface: '#ffffff',
    subtle: '#f1f2f5',
    muted: '#e3e6ec',
    inverse: '#272a30',
    hover: '#f1f2f5',
    active: '#e3e6ec',
    selected: '#ecf4fe',
    overlay: 'rgba(24,27,31,0.55)',
  },
  text: {
    primary: '#272a30',
    secondary: '#4f545e',
    muted: '#666c78',
    disabled: '#8a919d',
    inverse: '#ffffff',
    link: '#124c99',
    linkHover: '#083674',
    brand: '#124c99',
    success: '#006539',
    warning: '#704c00',
    danger: '#981e1f',
    info: '#005c7d',
  },
  border: {
    subtle: '#e3e6ec',
    default: '#d0d5de',
    strong: '#8a919d',
    brand: '#2667bc',
    danger: '#bc3130',
    success: '#00814b',
  },
  focusRing: '#2667bc',
  action: {
    primaryBg: '#2667bc',
    primaryBgHover: '#124c99',
    primaryBgActive: '#083674',
    primaryFg: '#ffffff',
    dangerBg: '#bc3130',
    dangerBgHover: '#981e1f',
    dangerBgActive: '#730f12',
    dangerFg: '#ffffff',
  },
  status: {
    neutral: { bg: '#f1f2f5', border: '#d0d5de', fg: '#393d45' },
    brand: { bg: '#ecf4fe', border: '#bed8fb', fg: '#083674' },
    success: { bg: '#e5f8eb', border: '#a3e7bc', fg: '#00341b', icon: '#006539' },
    warning: { bg: '#fef0dc', border: '#fbcd83', fg: '#3a2600', icon: '#704c00' },
    danger: { bg: '#ffeeec', border: '#ffc4be', fg: '#52090b', icon: '#981e1f' },
    info: { bg: '#e5f6ff', border: '#a2dfff', fg: '#002f42', icon: '#005c7d' },
  },
};

export const font = {
  // "sans" in Bufab is the OS system font — no files to load, just set
  // fontWeight; leaving fontFamily undefined lets RN use the platform default.
  display: {
    semiBold: 'Archivo_600SemiBold',
    bold: 'Archivo_700Bold',
  },
};

export const weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// project/tokens.json → type.groups. fontFamily omitted = system sans.
export const text = {
  display: { fontSize: 48, lineHeight: 48, fontWeight: weight.bold, letterSpacing: -0.7, fontFamily: font.display.bold },
  headingXl: { fontSize: 36, lineHeight: 45, fontWeight: weight.bold, letterSpacing: -0.5, fontFamily: font.display.bold },
  headingLg: { fontSize: 30, lineHeight: 38, fontWeight: weight.semibold, fontFamily: font.display.semiBold },
  headingMd: { fontSize: 24, lineHeight: 34, fontWeight: weight.semibold, fontFamily: font.display.semiBold },
  headingSm: { fontSize: 20, lineHeight: 28, fontWeight: weight.semibold, fontFamily: font.display.semiBold },
  headingXs: { fontSize: 18, lineHeight: 25, fontWeight: weight.semibold, fontFamily: font.display.semiBold },
  bodyLg: { fontSize: 18, lineHeight: 28, fontWeight: weight.regular },
  bodyMd: { fontSize: 16, lineHeight: 25, fontWeight: weight.regular },
  bodySm: { fontSize: 14, lineHeight: 22, fontWeight: weight.regular },
  bodyXs: { fontSize: 12, lineHeight: 19, fontWeight: weight.regular },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: weight.medium, letterSpacing: 0.44, textTransform: 'uppercase' as const },
};

// project/tokens.json → spacing.tokens (4px grid, 2px half-step)
export const space = {
  0: 0,
  '025': 2,
  '05': 4,
  1: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// project/tokens.json → radius.tokens
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 12,
  full: 9999,
};

// project/tokens.json → size.tokens (control heights)
export const controlHeight = {
  sm: 32,
  md: 40,
  lg: 48,
};

export const borderWidth = {
  thin: 1,
  thick: 2,
};

// project/tokens.json → shadow.tokens (light theme), translated to RN's
// shadow* (iOS) / elevation (Android) properties. RN can't express a layered
// box-shadow, so each takes the first (dominant) layer of the CSS value.
export const shadow = {
  xs: { shadowColor: '#181b1f', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  sm: { shadowColor: '#181b1f', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: '#181b1f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#181b1f', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  xl: { shadowColor: '#181b1f', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.14, shadowRadius: 40, elevation: 16 },
};
