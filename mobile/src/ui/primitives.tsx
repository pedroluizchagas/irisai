 import * as React from 'react'
 import { View, Text, Pressable, type ViewProps } from 'react-native'
 import { SafeAreaView } from 'react-native-safe-area-context'
 import Svg, { Circle as SvgCircle } from 'react-native-svg'
 import { useTheme } from '../theme/ThemeProvider'

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewProps['style'] }) {
  const { theme } = useTheme()
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[{ flex: 1, paddingTop: theme.spacing.lg, paddingHorizontal: theme.spacing.lg }, style]}>{children}</View>
    </SafeAreaView>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>{children}</Text>
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{children}</Text>
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewProps['style'] }) {
  const { theme } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  const { theme } = useTheme()
  const bg = active ? theme.colors.primary : theme.colors.surfaceAlt
  const fg = active ? '#0B0B0D' : theme.colors.text
  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: theme.colors.border,
        borderWidth: active ? 0 : 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: fg, fontWeight: '600' }}>{children}</Text>
    </View>
  )
}

export function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  const { theme } = useTheme()
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: color || theme.colors.overlay,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{children}</Text>
    </View>
  )
}

export function Progress({ value, max, color }: { value: number; max: number; color?: string }) {
  const { theme } = useTheme()
  const pct = Math.max(0, Math.min(1, value / max))
  const fg = color || theme.colors.primary
  return (
    <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: fg }} />
    </View>
  )
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewProps['style'] }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>
}

export function Spacer({ size = 12 }: { size?: number }) {
  return <View style={{ width: size, height: size }} />
}

export function ListItem({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  onPress?: () => void
}) {
  const { theme } = useTheme()
  const content = (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
        {subtitle ? <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{subtitle}</Text> : null}
      </View>
      {right || <Text style={{ color: theme.colors.textMuted }}>{'>'}</Text>}
    </View>
  )
  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>
  return content
}

export function RingProgress({
  value,
  max,
  size = 64,
  stroke = 8,
  color,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
}) {
  const { theme } = useTheme()
  const pct = Math.max(0, Math.min(1, value / max))
  const radius = size / 2 - stroke / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)
  const fg = color || theme.colors.primary
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fg}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  )
}
