import { View, Text } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle } from '../../src/ui/primitives'

export default function NotesScreen() {
  const { theme } = useTheme()
  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <SectionTitle>Notas</SectionTitle>
        <Subtitle>Registre ideias e informações importantes</Subtitle>
      </View>
      <View style={{ flex: 1, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, marginTop: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.textMuted }}>Tela de Notas (em construção)</Text>
      </View>
    </Screen>
  )
}
