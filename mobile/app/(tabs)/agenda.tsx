import { View, Text, ScrollView, Pressable } from 'react-native'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle, Card, Pill, Row, Spacer, Badge } from '../../src/ui/primitives'
import { Ionicons } from '@expo/vector-icons'

export default function AgendaScreen() {
  const { theme } = useTheme()
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <SectionTitle>Minha Agenda</SectionTitle>
          <Subtitle>Outubro 2023</Subtitle>
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

      <Spacer size={16} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Row style={{ gap: 10 }}>
          <Pill>SEG 23</Pill>
          <Pill>TER 24</Pill>
          <Pill active>QUA 25 •</Pill>
          <Pill>QUI 26</Pill>
          <Pill>SEX 27</Pill>
          <Pill>SAB 28</Pill>
        </Row>
      </ScrollView>

      <Spacer size={18} />

      <Card style={{ gap: 10 }}>
        <Row style={{ gap: 8, alignItems: 'center' }}>
          <Ionicons name="analytics" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Sugestão da Iris</Text>
        </Row>
        <Text style={{ color: theme.colors.textMuted }}>
          Notei um intervalo de 2h entre reuniões. Gostaria de agendar um tempo de foco para o projeto Alpha?
        </Text>
        <Row style={{ gap: 10 }}>
          <Pressable
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{ color: '#0B0B0D', fontWeight: '700' }}>Agendar Foco</Text>
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
            <Text style={{ color: theme.colors.text }}>Dispensar</Text>
          </Pressable>
        </Row>
      </Card>

      <Spacer size={22} />

      <SectionTitle>Cronograma</SectionTitle>

      <Spacer size={12} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 8, gap: 14 }}>
          <TimelineItem
            time="09:00 - 09:30"
            title="Daily-Scrum"
            subtitle="Equipe Tech"
            muted
          />
          <TimelineItem
            time="10:00 - 11:00"
            title="Reunião de Sprint"
            subtitle="Sala de Reuniões 3 • Presencial"
            highlighted
            avatars={2}
            badge="IMPORTANTE"
          />
          <TimelineItem
            time="12:30 - 13:30"
            title="Almoço com Cliente"
            subtitle="Restaurante Fasano"
            icon="restaurant"
          />
          <TimelineItem time="18:00 - 19:00" title="Academia" subtitle="Smart Fit" icon="barbell" />
        </View>
      </ScrollView>
    </Screen>
  )
}

function TimelineItem({
  time,
  title,
  subtitle,
  highlighted,
  muted,
  icon,
  avatars,
  badge,
}: {
  time: string
  title: string
  subtitle: string
  highlighted?: boolean
  muted?: boolean
  icon?: 'restaurant' | 'barbell'
  avatars?: number
  badge?: string
}) {
  const { theme } = useTheme()
  return (
    <Row style={{ gap: 12 }}>
      <View style={{ width: 28, alignItems: 'center' }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: highlighted ? theme.colors.primary : theme.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{time}</Text>
        <Card
          style={{
            gap: 8,
            borderColor: highlighted ? theme.colors.primary : theme.colors.border,
          }}
        >
          <Row style={{ justifyContent: 'space-between' }}>
            <Text
              style={{
                color: muted ? theme.colors.textMuted : theme.colors.text,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              {title}
            </Text>
            {avatars ? (
              <Row style={{ gap: -8 }}>
                <AvatarDot />
                <AvatarDot />
              </Row>
            ) : null}
          </Row>
          <Row style={{ gap: 8, alignItems: 'center' }}>
            {icon === 'restaurant' ? (
              <Ionicons name="restaurant" size={14} color={theme.colors.textMuted} />
            ) : icon === 'barbell' ? (
              <Ionicons name="barbell" size={14} color={theme.colors.textMuted} />
            ) : (
              <Ionicons name="location" size={14} color={theme.colors.textMuted} />
            )}
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{subtitle}</Text>
          </Row>
          {badge ? <Badge>{badge}</Badge> : null}
        </Card>
      </View>
    </Row>
  )
}

function AvatarDot() {
  const { theme } = useTheme()
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    />
  )
}
