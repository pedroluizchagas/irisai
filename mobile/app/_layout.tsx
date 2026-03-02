import { Stack } from 'expo-router'
import * as Sentry from 'sentry-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'react-native'
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider'

const queryClient = new QueryClient()

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: false,
})

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function ThemedStack() {
  const { scheme } = useTheme()
  return (
    <>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
