export interface Palette {
  background: string;
  surface: string;
  surfaceHigh: string;
  outline: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  overdue: string;
  scrim: string;
}

export const darkColors: Palette = {
  background: '#121212',
  surface: '#1B1B1D',
  surfaceHigh: '#242427',
  outline: '#2E2E32',
  textPrimary: '#F3F4F6',
  textSecondary: '#A1A1AA',
  accent: '#B5E48C',
  onAccent: '#121212',
  overdue: '#F2A488',
  scrim: 'rgba(18, 18, 18, 0.72)',
};

export const lightColors: Palette = {
  background: '#F3F4F6',
  surface: '#FAFAFA',
  surfaceHigh: '#E8E9EC',
  outline: '#D4D4D8',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  accent: '#3F7A22',
  onAccent: '#F3F4F6',
  overdue: '#B4482A',
  scrim: 'rgba(24, 24, 27, 0.45)',
};

export const fonts = {
  ui: 'Manrope_400Regular',
  uiStrong: 'Manrope_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoStrong: 'JetBrainsMono_700Bold',
} as const;

export const fontSize = { caption: 12, body: 16, title: 20, heading: 28, display: 32 } as const;
export const lineHeight = { caption: 16, body: 24, title: 28, heading: 36, display: 40 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 8, md: 16, lg: 24 } as const;
export const size = { row: 56, touch: 48, fab: 56, checkbox: 24 } as const;
