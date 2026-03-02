import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { View, Pressable, Text, Dimensions, Switch } from 'react-native'
import { BlurView } from 'expo-blur'
import { useTheme } from '../../src/theme/ThemeProvider'

export const SettingsSheetContext = React.createContext<{ openSettings: () => void; openNotifications: () => void } | null>(null)
export function useSettingsSheet() {
  const ctx = React.useContext(SettingsSheetContext)
  if (!ctx) throw new Error('useSettingsSheet must be used within TabsLayout')
  return ctx
}
export function useNotificationsSheet() {
  const ctx = React.useContext(SettingsSheetContext)
  if (!ctx) throw new Error('useNotificationsSheet must be used within TabsLayout')
  return { openNotifications: ctx.openNotifications }
}

export default function TabsLayout() {
  const { theme, toggleScheme, scheme } = useTheme()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [syncEnabled, setSyncEnabled] = React.useState(true)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [notifInboxOpen, setNotifInboxOpen] = React.useState(false)
  const [notifAll, setNotifAll] = React.useState(true)
  const [notifTasks, setNotifTasks] = React.useState(true)
  const [notifFinance, setNotifFinance] = React.useState(true)
  const [notifIris, setNotifIris] = React.useState(true)
  const [notifAgenda, setNotifAgenda] = React.useState(true)
  const [notifSounds, setNotifSounds] = React.useState(true)
  const [notifVibration, setNotifVibration] = React.useState(false)
  const [notifCleared, setNotifCleared] = React.useState(false)
  const tabHeight = 80
  const screenWidth = Dimensions.get('window').width
  const menuWidth = screenWidth - 24

  return (
    <SettingsSheetContext.Provider value={{ openSettings: () => setSettingsOpen(true), openNotifications: () => setNotifInboxOpen(true) }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surfaceAlt,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: tabHeight,
            paddingTop: 6,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="iris"
          options={{
            title: 'Iris',
            tabBarIcon: ({ color }) => (
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -24,
                  shadowColor: theme.colors.primary,
                  shadowOpacity: 0.45,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 12,
                }}
              >
                <Ionicons name="mic" size={30} color="#0B0B0D" />
              </View>
            ),
            tabBarLabel: 'Iris',
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            title: 'Financeiro',
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Mais',
            tabBarButton: (props) => (
              <Pressable
                accessibilityRole={props.accessibilityRole}
                accessibilityState={props.accessibilityState}
                onPress={() => setMoreOpen((v) => !v)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>Mais</Text>
              </Pressable>
            ),
          }}
        />
      </Tabs>

      {moreOpen ? (
        <Pressable
          onPress={() => setMoreOpen(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 100,
          }}
        >
          <BlurView intensity={25} tint={theme.name === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Pressable
            onPress={() => {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -10,
                alignSelf: 'center',
                width: 50,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable
                onPress={() => {
                  setMoreOpen(false)
                  router.push('/tasks')
                }}
                style={{ alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    backgroundColor: theme.colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Ionicons name="checkmark-done" size={26} color={theme.colors.primary} />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 12 }}>Tarefas</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMoreOpen(false)
                  router.push('/goals')
                }}
                style={{ alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: theme.colors.primary,
                    shadowOpacity: 0.35,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 12,
                  }}
                >
                  <Ionicons name="radio-button-on" size={26} color="#0B0B0D" />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 12, textAlign: 'center' }}>Metas e{'\n'}Hábitos</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMoreOpen(false)
                  router.push('/notes')
                }}
                style={{ alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    backgroundColor: theme.colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Ionicons name="document-text" size={26} color={theme.colors.primary} />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 12 }}>Notas</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      ) : null}
      {notifInboxOpen ? (
        <Pressable
          onPress={() => setNotifInboxOpen(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 250,
          }}
        >
          <BlurView intensity={30} tint={theme.name === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Pressable
            onPress={() => {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -10,
                alignSelf: 'center',
                width: 50,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Notificações</Text>
              <Pressable onPress={() => setNotifCleared(true)}>
                <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>Limpar Tudo</Text>
              </Pressable>
            </View>
            <View style={{ height: 16 }} />
            {!notifCleared ? (
              <View style={{ gap: 12 }}>
                <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                      <View style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.border, borderWidth: 1 }}>
                        <Ionicons name="remove" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>FINANCEIRO</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>
                          Novo Gasto: <Text style={{ color: theme.colors.text, fontWeight: '800' }}>R$ 45,00</Text> em Uber
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 12 }}>2m atrás</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                      <View style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.border, borderWidth: 1 }}>
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>TAREFA</Text>
                        <View style={{ gap: 10 }}>
                          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Lembrar de ligar para Luís</Text>
                          <Pressable style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                            <Ionicons name="checkmark" size={14} color="#0B0B0D" />
                            <Text style={{ color: '#0B0B0D', fontSize: 12, fontWeight: '700' }}>Concluir</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 12 }}>15m atrás</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                      <View style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 12 }}>
                        <Text style={{ color: '#0B0B0D', fontSize: 12, fontWeight: '800' }}>bolt</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>INSIGHT IA</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 15 }}>
                          Iris: Sua produtividade subiu <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>10%</Text>! continue assim.
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 12 }}>1h atrás</Text>
                  </View>
                </View>

                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>ONTEM</Text>
                <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                      <View style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderColor: theme.colors.border, borderWidth: 1 }}>
                        <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>SISTEMA</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Relatório semanal disponível para leitura.</Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 12 }}>23h atrás</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, padding: theme.spacing.lg, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textMuted }}>Sem notificações</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      ) : null}
      {settingsOpen ? (
        <Pressable
          onPress={() => setSettingsOpen(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 200,
          }}
        >
          <BlurView intensity={30} tint={theme.name === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Pressable
            onPress={() => {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -10,
                alignSelf: 'center',
                width: 50,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Configurações</Text>
            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>PREFERÊNCIAS DO SISTEMA</Text>
            <View style={{ height: 8 }} />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
              }}
            >
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="moon" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Tema Escuro</Text>
                </View>
                <Switch
                  value={scheme === 'dark'}
                  onValueChange={() => toggleScheme()}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={scheme === 'dark' ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <Pressable style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="globe" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Idioma</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.textMuted }}>Português</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
              </Pressable>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <Pressable onPress={() => setNotifOpen(true)} style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="notifications" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Notificações</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
              </Pressable>
            </View>
            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>CONFIGURAÇÕES DO APP</Text>
            <View style={{ height: 8 }} />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
              }}
            >
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="flash" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Sincronização</Text>
                </View>
                <Switch
                  value={syncEnabled}
                  onValueChange={setSyncEnabled}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={syncEnabled ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <Pressable style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="shield" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Privacidade</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>GERAL</Text>
            <View style={{ height: 8 }} />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
              }}
            >
              <Pressable style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="help-circle" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Ajuda e Suporte</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      ) : null}
      {notifOpen ? (
        <Pressable
          onPress={() => setNotifOpen(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 300,
          }}
        >
          <BlurView intensity={30} tint={theme.name === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Pressable
            onPress={() => {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.xl,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -10,
                alignSelf: 'center',
                width: 50,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Notificações</Text>
            <View style={{ height: 16 }} />

            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>ALERTAS DO SISTEMA</Text>
            <View style={{ height: 8 }} />
            <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg }}>
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="notifications" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Habilitar Todas</Text>
                </View>
                <Switch
                  value={notifAll}
                  onValueChange={(v) => {
                    setNotifAll(v)
                    setNotifTasks(v)
                    setNotifFinance(v)
                    setNotifIris(v)
                    setNotifAgenda(v)
                    setNotifSounds(v)
                    setNotifVibration(v)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifAll ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
            </View>

            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>LEMBRETES DE ATIVIDADE</Text>
            <View style={{ height: 8 }} />
            <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg }}>
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Lembretes de Tarefas</Text>
                </View>
                <Switch
                  value={notifTasks}
                  onValueChange={(v) => {
                    setNotifTasks(v)
                    setNotifAll(v && notifFinance && notifIris && notifAgenda && notifSounds && notifVibration)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifTasks ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="cash" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Alertas Financeiros</Text>
                </View>
                <Switch
                  value={notifFinance}
                  onValueChange={(v) => {
                    setNotifFinance(v)
                    setNotifAll(v && notifTasks && notifIris && notifAgenda && notifSounds && notifVibration)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifFinance ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="pulse" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Resumos da Iris</Text>
                </View>
                <Switch
                  value={notifIris}
                  onValueChange={(v) => {
                    setNotifIris(v)
                    setNotifAll(v && notifTasks && notifFinance && notifAgenda && notifSounds && notifVibration)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifIris ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Agenda e Compromissos</Text>
                </View>
                <Switch
                  value={notifAgenda}
                  onValueChange={(v) => {
                    setNotifAgenda(v)
                    setNotifAll(v && notifTasks && notifFinance && notifIris && notifSounds && notifVibration)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifAgenda ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
            </View>

            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>SOM E VIBRAÇÃO</Text>
            <View style={{ height: 8 }} />
            <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg }}>
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="volume-high" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Sons de Notificação</Text>
                </View>
                <Switch
                  value={notifSounds}
                  onValueChange={(v) => {
                    setNotifSounds(v)
                    setNotifAll(v && notifTasks && notifFinance && notifIris && notifAgenda && notifVibration)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifSounds ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="phone-portrait" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Vibração</Text>
                </View>
                <Switch
                  value={notifVibration}
                  onValueChange={(v) => {
                    setNotifVibration(v)
                    setNotifAll(v && notifTasks && notifFinance && notifIris && notifAgenda && notifSounds)
                  }}
                  trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }}
                  thumbColor={notifVibration ? '#0B0B0D' : '#FFFFFF'}
                  ios_backgroundColor={theme.colors.surfaceAlt}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      ) : null}
    </SettingsSheetContext.Provider>
  )
}
