export type ThemeName = 'dark' | 'light'

export type Theme = {
  name: ThemeName
  colors: {
    background: string
    surface: string
    surfaceAlt: string
    border: string
    text: string
    textMuted: string
    primary: string
    success: string
    warning: string
    error: string
    overlay: string
  }
  radius: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#0B0B0D',
    surface: '#121315',
    surfaceAlt: '#1A1D1F',
    border: '#26292C',
    text: '#E8EAED',
    textMuted: '#9AA0A6',
    primary: '#06D67A',
    success: '#06D67A',
    warning: '#F0C419',
    error: '#E94D3D',
    overlay: 'rgba(6, 214, 122, 0.15)',
  },
  radius: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
  },
  spacing: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#F7F7F8',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F5',
    border: '#E0E3E7',
    text: '#101317',
    textMuted: '#5F6C77',
    primary: '#06D67A',
    success: '#06D67A',
    warning: '#F0C419',
    error: '#E94D3D',
    overlay: 'rgba(6, 214, 122, 0.12)',
  },
  radius: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
  },
  spacing: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
}

export function mergeTheme(base: Theme, overrides?: Partial<Theme>): Theme {
  if (!overrides) return base
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...(overrides.colors || {}) },
    radius: { ...base.radius, ...(overrides.radius || {}) },
    spacing: { ...base.spacing, ...(overrides.spacing || {}) },
  }
}
