import * as React from 'react'
import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle, Card, Row, Spacer, Progress } from '../../src/ui/primitives'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsSheet, useNotificationsSheet } from './_layout'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const { theme } = useTheme()
  const { openSettings } = useSettingsSheet()
  const { openNotifications } = useNotificationsSheet()
  const router = useRouter()
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Row style={{ gap: 12, alignItems: 'center' }}>
          <Pressable
            onPress={() => router.push('/more')}
            style={{ position: 'relative' }}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1603415526960-f7e0328d14e6?w=80&q=80' }}
              style={{ width: 42, height: 42, borderRadius: 21 }}
            />
            <View
              style={{
                position: 'absolute',
                right: -1,
                bottom: -1,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: theme.colors.background,
              }}
            >
              <Ionicons name="checkmark" size={12} color="#0B0B0D" />
            </View>
          </Pressable>
          <View>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Olá, Pedro Luiz</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Seu dia em resumo</Text>
          </View>
        </Row>
        <Row style={{ gap: 10 }}>
          <Pressable
            onPress={openNotifications}
            style={{
              height: 34,
              width: 34,
              borderRadius: 17,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="notifications" size={18} color={theme.colors.text} />
          </Pressable>
          <Pressable
            onPress={openSettings}
            style={{
              height: 34,
              width: 34,
              borderRadius: 17,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="settings" size={18} color={theme.colors.text} />
          </Pressable>
        </Row>
      </Row>

      <Spacer size={16} />

      <Row style={{ gap: 8, alignItems: 'center' }}>
        <Ionicons name="flash" size={16} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>RESUMO DO DIA</Text>
      </Row>

      <Spacer size={12} />

      <Card
        style={{
          backgroundColor: theme.colors.overlay,
          borderColor: theme.colors.border,
          gap: 10,
        }}
      >
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text }}>
            Você tem <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>4 tarefas</Text> para hoje e uma reunião importante às 10:00. Sua saúde financeira está estável.
          </Text>
          <Pressable
            style={{
              height: 28,
              width: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </Pressable>
        </Row>
      </Card>

      <Spacer size={16} />

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card style={{ width: '48%', gap: 10 }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Tarefas Hoje</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>4</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>1 pendente</Text>
          </Card>

          <Card style={{ width: '48%', gap: 10 }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="calendar" size={20} color={theme.colors.text} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Agenda</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>3</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Próxima em 20m</Text>
          </Card>

          <Card style={{ width: '48%', gap: 10 }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="document-text" size={20} color={theme.colors.text} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Notas</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>12</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>2 novas</Text>
          </Card>

          <Card style={{ width: '48%', gap: 10 }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="wallet" size={20} color={theme.colors.text} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Saldo</Text>
            </Row>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>R$ 12.450</Text>
          </Card>
        </View>
      </View>

      <Spacer size={16} />

      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>Financeiro Mensal</SectionTitle>
          <Pressable>
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Ver extrato</Text>
          </Pressable>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6 }}>
            <Ionicons name="trending-up" size={16} color={theme.colors.success} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Receitas</Text>
          </Row>
          <Text style={{ color: theme.colors.success, fontWeight: '700' }}>R$ 8.240,00</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6 }}>
            <Ionicons name="trending-down" size={16} color={theme.colors.error} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Despesas</Text>
          </Row>
          <Text style={{ color: theme.colors.error, fontWeight: '700' }}>R$ 3.150,00</Text>
        </Row>
        <View style={{ gap: 8 }}>
          <Progress value={8240} max={10000} color={theme.colors.success} />
          <Progress value={3150} max={10000} color={theme.colors.error} />
        </View>
      </Card>

      <Spacer size={16} />

      <SectionTitle>Próximos Compromissos</SectionTitle>

      <Spacer size={12} />

      <View style={{ gap: 12 }}>
        <View>
          <Card style={{ paddingVertical: theme.spacing.lg }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: theme.colors.primary, borderTopLeftRadius: theme.radius.lg, borderBottomLeftRadius: theme.radius.lg }} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.success, fontWeight: '700' }}>10:00 - 11:00</Text>
              <Ionicons name="earth" size={18} color={theme.colors.textMuted} />
            </Row>
            <Spacer size={8} />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>Reunião de Sprint</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Equipe de Design • Sala 3</Text>
          </Card>
        </View>

        <View>
          <Card style={{ paddingVertical: theme.spacing.lg }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: theme.colors.surfaceAlt, borderTopLeftRadius: theme.radius.lg, borderBottomLeftRadius: theme.radius.lg }} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>14:30 - 15:30</Text>
              <Ionicons name="restaurant" size={18} color={theme.colors.textMuted} />
            </Row>
            <Spacer size={8} />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>Almoço com Cliente</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Restaurante Fasano</Text>
          </Card>
        </View>
      </View>

      <Spacer size={16} />

      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>Metas do Dia</SectionTitle>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>75%</Text>
        </Row>
        <Progress value={3} max={4} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>3 de 4 tarefas concluídas</Text>
      </Card>
      </ScrollView>
    </Screen>
  )
}
