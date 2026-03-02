import { useState, useCallback, useRef } from 'react'
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useTheme } from '../../theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle, Card, Row, Spacer, Badge, Progress } from '../../ui/primitives'
import { Ionicons } from '@expo/vector-icons'

export function ChatScreen() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const { theme } = useTheme()

  const send = useCallback(async () => {
    if (!input) return
    setLoading(true)
    setReply('')
    const token = await SecureStore.getItemAsync('iris-token')
    const res = await fetch((process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: input }],
      }),
    })
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setReply((prev) => prev + chunk)
        scrollRef.current?.scrollToEnd({ animated: true })
      }
    }
    setLoading(false)
  }, [input])

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <SectionTitle>Iris Assistente</SectionTitle>
          <Row style={{ gap: 6, alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Online</Text>
          </Row>
        </View>
        <Row style={{ gap: 12 }}>
          <Ionicons name="call" size={20} color={theme.colors.text} />
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
        </Row>
      </Row>

      <Spacer size={16} />

      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 14 }}>
          <Row style={{ justifyContent: 'flex-end' }}>
            <View
              style={{
                maxWidth: '80%',
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
              }}
            >
              <Text style={{ color: theme.colors.text }}>
                Registrar um gasto de R$ 35,00 em alimentação
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 6 }}>Hoje, 09:30</Text>
            </View>
          </Row>

          <Row style={{ justifyContent: 'flex-start' }}>
            <View
              style={{
                maxWidth: '85%',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              <Text style={{ color: theme.colors.text }}>
                {reply || 'Pronto, Pedro! Lançamento de R$ 35,00 em Alimentação registrado com sucesso.'}
              </Text>
              <Spacer size={10} />
              <Row style={{ gap: 8 }}>
                <Pressable
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: theme.radius.md,
                  }}
                >
                  <Text style={{ color: '#0B0B0D', fontWeight: '700' }}>Ver Extrato</Text>
                </Pressable>
                <Pressable
                  style={{
                    backgroundColor: theme.colors.surfaceAlt,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>Editar</Text>
                </Pressable>
              </Row>
            </View>
          </Row>

          <Card style={{ gap: 12 }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Ionicons name="stats-chart" size={18} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Sugestão da Iris</Text>
            </Row>
            <Text style={{ color: theme.colors.text }}>
              Você já consumiu <Text style={{ fontWeight: '700' }}>65%</Text> do seu orçamento mensal. A categoria Transporte está acima da média.
            </Text>
            <Progress value={3150} max={4800} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textMuted }}>Gasto: R$ 3.150</Text>
              <Text style={{ color: theme.colors.textMuted }}>Limite: R$ 4.800</Text>
            </Row>
          </Card>
        </View>
      </ScrollView>

      <Spacer size={12} />

      <Row style={{ gap: 10, alignItems: 'center' }}>
        <Pressable
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="add" size={20} color={theme.colors.text} />
        </Pressable>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.lg,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.colors.textMuted}
            style={{ color: theme.colors.text, fontSize: 15 }}
          />
        </View>
        <Pressable
          onPress={send}
          disabled={loading}
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-forward" size={20} color="#0B0B0D" />
        </Pressable>
      </Row>
    </Screen>
  )
}
