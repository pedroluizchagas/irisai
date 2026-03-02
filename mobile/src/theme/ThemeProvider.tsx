import * as React from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import { darkTheme, lightTheme, type Theme, type ThemeName } from './theme'

type ThemeContextValue = {
  theme: Theme
  scheme: ThemeName
  setScheme: (next: ThemeName) => void
  toggleScheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialScheme = (Appearance.getColorScheme() as ColorSchemeName) === 'dark' ? 'dark' : 'light'
  const [scheme, setScheme] = React.useState<ThemeName>(initialScheme as ThemeName)

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme((colorScheme as ThemeName) || 'light')
    })
    return () => sub.remove()
  }, [])

  const theme = scheme === 'dark' ? darkTheme : lightTheme

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      scheme,
      setScheme: (next) => setScheme(next),
      toggleScheme: () => setScheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [scheme, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
