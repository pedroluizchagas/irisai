import { View, Text, Pressable } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle, Card, Row, Spacer, Progress, ListItem, Badge } from '../../src/ui/primitives'
import { Ionicons } from '@expo/vector-icons'

export default function FinanceScreen() {
  const { theme } = useTheme()
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <SectionTitle>Meu Financeiro</SectionTitle>
          <Subtitle>Gestão inteligente</Subtitle>
        </View>
        <Row style={{ gap: 10 }}>
          <Pressable
            style={{
              height: 34,
              width: 34,
              borderRadius: 17,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="search" size={18} color={theme.colors.text} />
          </Pressable>
          <Pressable
            style={{
              height: 34,
              width: 34,
              borderRadius: 17,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={20} color={theme.colors.text} />
          </Pressable>
        </Row>
      </Row>

      <Spacer size={18} />

      <Card style={{ gap: 10 }}>
        <Row style={{ gap: 8, alignItems: 'center' }}>
          <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Insight Iris</Text>
        </Row>
        <Text style={{ color: theme.colors.text }}>
          Sua categoria <Text style={{ fontWeight: '700', color: theme.colors.text }}>Lazer</Text> está 15% acima do esperado este mês. Quer ajustar seu limite?
        </Text>
        <Row>
          <Pressable
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{ color: '#0B0B0D', fontWeight: '700' }}>Revisar Orçamento</Text>
          </Pressable>
        </Row>
      </Card>

      <Spacer size={18} />

      <Card style={{ gap: 12 }}>
        <Text style={{ color: theme.colors.textMuted }}>Saldo Geral</Text>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '800' }}>R$ 12.450,00</Text>
        <Row style={{ gap: 10 }}>
          <Card style={{ flex: 1, gap: 6, backgroundColor: theme.colors.surfaceAlt }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="arrow-down-circle" size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textMuted }}>Entradas</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>R$ 8.240</Text>
          </Card>
          <Card style={{ flex: 1, gap: 6, backgroundColor: theme.colors.surfaceAlt }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="arrow-up-circle" size={16} color={theme.colors.error} />
              <Text style={{ color: theme.colors.textMuted }}>Saídas</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>R$ 3.150</Text>
          </Card>
        </Row>
      </Card>

      <Spacer size={18} />

      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Categorias</Text>
        <Text style={{ color: theme.colors.textMuted }}>Ver todas</Text>
      </Row>

      <Spacer size={12} />

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.text }}>Alimentação</Text>
          <Text style={{ color: theme.colors.textMuted }}>R$ 850 / R$ 1.200</Text>
        </Row>
        <Progress value={850} max={1200} color={theme.colors.primary} />
      </Card>
      <Spacer size={10} />
      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.text }}>Transporte</Text>
          <Text style={{ color: theme.colors.textMuted }}>R$ 320 / R$ 500</Text>
        </Row>
        <Progress value={320} max={500} color="#9A6AFF" />
      </Card>
      <Spacer size={10} />
      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.text }}>Lazer</Text>
          <Text style={{ color: theme.colors.textMuted }}>R$ 450 / R$ 400</Text>
        </Row>
        <Progress value={450} max={400} color={theme.colors.error} />
        <Badge color="rgba(233,77,61,0.15)">Acima do limite</Badge>
      </Card>

      <Spacer size={18} />

      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Transações Recentes</Text>

      <Spacer size={10} />

      <ListItem title="Supermercado Extra" subtitle="Hoje, 18:30" right={<Text style={{ color: theme.colors.error, fontWeight: '700' }}>- R$ 245,00</Text>} />
      <Spacer size={8} />
      <ListItem title="Posto Shell" subtitle="Ontem, 08:15" right={<Text style={{ color: theme.colors.error, fontWeight: '700' }}>- R$ 180,00</Text>} />
      <Spacer size={8} />
      <ListItem title="Reembolso Uber" subtitle="Segunda, 14:00" right={<Text style={{ color: theme.colors.primary, fontWeight: '700' }}>+ R$ 42,50</Text>} />
    </Screen>
  )
}
