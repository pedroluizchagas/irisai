import { View, Text, Pressable, Image } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Card, Row, Spacer, ListItem } from '../../src/ui/primitives'
import { Ionicons } from '@expo/vector-icons'

export default function MoreScreen() {
  const { theme, toggleScheme, scheme } = useTheme()
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle>Meu Perfil</SectionTitle>
        <Pressable>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Salvar</Text>
        </Pressable>
      </Row>

      <Spacer size={16} />

      <Row style={{ gap: 14, alignItems: 'center' }}>
        <View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1603415526960-f7e0328d14e6?w=80&q=80' }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
          <View
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}
          >
            <Ionicons name="checkmark" size={14} color="#0B0B0D" />
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Pedro Luiz</Text>
          <Text style={{ color: theme.colors.textMuted }}>pedro.luiz@email.com</Text>
        </View>
      </Row>

      <Spacer size={16} />

      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceAlt }}>
          <Ionicons name="flame" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>15d Streak</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceAlt }}>
          <Ionicons name="sync" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>85% Prod.</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceAlt }}>
          <Ionicons name="star" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text }}>Premium</Text>
        </Card>
      </Row>

      <Spacer size={18} />

      <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>CONTA</Text>
      <Spacer size={8} />
      <ListItem title="Informações Pessoais" />
      <Spacer size={8} />
      <ListItem title="Segurança" />
      <Spacer size={8} />
      <ListItem title="Assinatura" />

      <Spacer size={18} />

      <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>PREFERÊNCIAS</Text>
      <Spacer size={8} />
      <ListItem title="Tema" subtitle={scheme === 'dark' ? 'Escuro' : 'Claro'} onPress={toggleScheme} />
      <Spacer size={8} />
      <ListItem title="Notificações" subtitle="Ativo" />
      <Spacer size={8} />
      <ListItem title="Idioma" subtitle="Português" />

      <Spacer size={18} />

      <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>IRIS AI</Text>
      <Spacer size={8} />
      <ListItem title="Voz da Iris" subtitle="Natural (Feminina)" />
      <Spacer size={8} />
      <ListItem title="Personalidade" subtitle="Profissional" />

      <Spacer size={18} />

      <Pressable
        style={{
          paddingVertical: 14,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.error,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.error, fontWeight: '700' }}>Sair da Conta</Text>
      </Pressable>

      <Spacer size={12} />

      <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>IrisAI v2.4.0 (Build 3021)</Text>
    </Screen>
  )
}
