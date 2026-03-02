import { View } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { ChatScreen } from '../../src/features/chat/ChatScreen'

export default function IrisScreen() {
  const { theme } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ChatScreen />
    </View>
  )
}
