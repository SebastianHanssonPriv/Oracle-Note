// Design tokens lifted directly from project/Oracle Note - Flow.dc.html
// (the decided, concept-aligned prototype in the design handoff bundle).

export const ink = (alpha: number) => `rgba(29,31,32,${alpha})`;

export const color = {
  paper: '#f2f2f3',
  ink: '#1d1f20',
  blueprint: '#416180',
  steel: '#5980a6',
  steelLight: '#94bce3',
  paleBlueBg: '#eef6ff',
  paleBlueBorder: 'rgba(89,128,166,0.4)',
  paleBlueBorderStrong: 'rgba(89,128,166,0.5)',
  border: ink(0.16),
  borderStrong: ink(0.5),
  white: '#ffffff',
  highlightMark: '#d6ebff',
};

export const font = {
  body: {
    regular: 'Barlow_400Regular',
    medium: 'Barlow_500Medium',
    semiBold: 'Barlow_600SemiBold',
    bold: 'Barlow_700Bold',
  },
  condensed: {
    regular: 'BarlowCondensed_400Regular',
    semiBold: 'BarlowCondensed_600SemiBold',
  },
};

// The .bp registration-mark corner size in the source CSS (11px square, offset -6px).
export const REG_MARK = { size: 11, offset: -6, thickness: 1 };
