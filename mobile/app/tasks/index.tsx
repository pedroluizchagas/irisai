import * as React from 'react'
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/ThemeProvider'
import { Screen, SectionTitle, Subtitle, Card, Row, Spacer, Pill, Badge, Progress, RingProgress } from '../../src/ui/primitives'
import { listTasks, createTask } from '../../src/api/client'
import type { Task } from '@iris/domain'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function formatTime(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function isToday(iso: string | null) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isTomorrow(iso: string | null) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate()
}

function priorityLabel(p: Task['priority']) {
  if (p === 'urgent') return 'Urgente'
  if (p === 'high') return 'Alta'
  if (p === 'medium') return 'Média'
  return 'Baixa'
}

export default function TasksScreen() {
  const { theme } = useTheme()
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'urgent' | 'work' | 'personal'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', { limit: 100 }],
    queryFn: async () => {
      const res = await listTasks({ limit: 100 })
      return res.data || []
    },
  })
  const tasks = (data || []) as Task[]

  const createMut = useMutation({
    mutationFn: async (t: { title: string }) => {
      const res = await createTask({ title: t.title, description: null, status: 'todo', priority: 'medium', due_date: null, tags: null })
      return res.data
    },
    onSuccess: () => {
      setTitle('')
      setShowAdd(false)
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const filtered = tasks.filter((t) => {
    if (filter === 'urgent') return t.priority === 'urgent'
    if (filter === 'work') return (t.tags || '').toLowerCase().includes('trabalho')
    if (filter === 'personal') return (t.tags || '').toLowerCase().includes('pessoal') || (t.tags || '').toLowerCase().includes('casa')
    return true
  })
  const today = filtered.filter((t) => isToday(t.due_date))
  const tomorrow = filtered.filter((t) => isTomorrow(t.due_date))
  const todayDone = today.filter((t) => t.status === 'done').length
  const productivity = today.length > 0 ? Math.round((todayDone / today.length) * 100) : 0

  const projectsMap = new Map<string, Task[]>()
  filtered.forEach((t) => {
    const tag = (t.tags || '').trim() || 'Geral'
    const key = tag.split(',')[0]
    if (!projectsMap.has(key)) projectsMap.set(key, [])
    projectsMap.get(key)!.push(t)
  })
  const projects = [...projectsMap.entries()].slice(0, 2)

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: theme.spacing.xl, gap: 16 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 6 }}>
            <SectionTitle>Minhas Tarefas</SectionTitle>
            <Subtitle>Organize, priorize e acompanhe seu trabalho</Subtitle>
          </View>
          <Row style={{ gap: 10 }}>
            <Pressable style={{ backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="search" size={18} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => setShowAdd((v) => !v)} style={{ backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={showAdd ? 'close' : 'add'} size={22} color={theme.colors.text} />
            </Pressable>
          </Row>
        </Row>

        {showAdd ? (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Nova tarefa</Text>
            <TextInput
              placeholder="Título"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
              style={{
                backgroundColor: theme.colors.surfaceAlt,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.colors.text,
              }}
            />
            <Row style={{ justifyContent: 'flex-end' }}>
              <Pressable
                disabled={createMut.isPending || !title.trim()}
                onPress={() => createMut.mutate({ title })}
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: theme.radius.md,
                  opacity: createMut.isPending || !title.trim() ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#0B0B0D', fontWeight: '700' }}>{createMut.isPending ? 'Criando...' : 'Adicionar'}</Text>
              </Pressable>
            </Row>
          </Card>
        ) : null}

        <Card style={{ padding: 18 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ gap: 8, flex: 1 }}>
              <Row style={{ gap: 8 }}>
                <Ionicons name="flash" size={16} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Produtividade</Text>
              </Row>
              <Text style={{ color: theme.colors.textMuted }}>
                Você concluiu <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{productivity}%</Text> das suas tarefas hoje. Falta apenas uma para bater sua meta!
              </Text>
            </View>
            <RingProgress value={productivity} max={100} size={64} stroke={8} />
          </Row>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          <Pressable onPress={() => setFilter('all')}>
            <Pill active={filter === 'all'}>Tudo</Pill>
          </Pressable>
          <Pressable onPress={() => setFilter('urgent')}>
            <Pill active={filter === 'urgent'}>Urgente</Pill>
          </Pressable>
          <Pressable onPress={() => setFilter('work')}>
            <Pill active={filter === 'work'}>Trabalho</Pill>
          </Pressable>
          <Pressable onPress={() => setFilter('personal')}>
            <Pill active={filter === 'personal'}>Pessoal</Pill>
          </Pressable>
        </ScrollView>

        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Hoje</Text>
          {isLoading ? (
            <Card><Text style={{ color: theme.colors.textMuted }}>Carregando...</Text></Card>
          ) : today.length === 0 ? (
            <Card><Text style={{ color: theme.colors.textMuted }}>Sem tarefas para hoje</Text></Card>
          ) : (
            today.map((t) => {
              const badgeColor =
                t.priority === 'urgent' ? theme.colors.error :
                t.priority === 'high' ? '#3A2E2E' :
                t.priority === 'medium' ? '#253A2F' :
                '#22262B'
              const badgeTextColor =
                t.priority === 'urgent' ? '#fff' :
                t.priority === 'high' ? '#fff' :
                t.priority === 'medium' ? theme.colors.text :
                theme.colors.text
              return (
                <Card key={t.id} style={{ paddingVertical: 14, paddingHorizontal: 14 }}>
                  <Row style={{ gap: 12, justifyContent: 'space-between' }}>
                    <Row style={{ gap: 12, flex: 1 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: t.status === 'done' ? theme.colors.success : 'transparent' }}>
                        {t.status === 'done' ? <Ionicons name="checkmark" size={14} color={'#0B0B0D'} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>{t.title}</Text>
                        <Row style={{ gap: 6 }}>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{(t.tags || '').split(',')[0] || 'Pessoal'}</Text>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>•</Text>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{formatTime(t.due_date)}</Text>
                        </Row>
                      </View>
                    </Row>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ backgroundColor: badgeColor, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                        <Text style={{ color: badgeTextColor, fontSize: 12, fontWeight: '600' }}>{priorityLabel(t.priority)}</Text>
                      </View>
                    </View>
                  </Row>
                </Card>
              )
            })
          )}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Amanhã</Text>
          {tomorrow.length === 0 ? (
            <Card><Text style={{ color: theme.colors.textMuted }}>Sem tarefas para amanhã</Text></Card>
          ) : (
            tomorrow.map((t) => {
              const badgeColor =
                t.priority === 'urgent' ? theme.colors.error :
                t.priority === 'high' ? '#3A2E2E' :
                t.priority === 'medium' ? '#253A2F' :
                '#22262B'
              const badgeTextColor =
                t.priority === 'urgent' ? '#fff' :
                t.priority === 'high' ? '#fff' :
                t.priority === 'medium' ? theme.colors.text :
                theme.colors.text
              return (
                <Card key={t.id} style={{ paddingVertical: 14, paddingHorizontal: 14 }}>
                  <Row style={{ gap: 12, justifyContent: 'space-between' }}>
                    <Row style={{ gap: 12, flex: 1 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: t.status === 'done' ? theme.colors.success : 'transparent' }}>
                        {t.status === 'done' ? <Ionicons name="checkmark" size={14} color={'#0B0B0D'} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>{t.title}</Text>
                        <Row style={{ gap: 6 }}>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{(t.tags || '').split(',')[0] || 'Pessoal'}</Text>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>•</Text>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{formatTime(t.due_date)}</Text>
                        </Row>
                      </View>
                    </Row>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ backgroundColor: badgeColor, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                        <Text style={{ color: badgeTextColor, fontSize: 12, fontWeight: '600' }}>{priorityLabel(t.priority)}</Text>
                      </View>
                    </View>
                  </Row>
                </Card>
              )
            })
          )}
        </View>

        <View style={{ gap: 12 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Projetos</Text>
            <Pressable><Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Ver todos</Text></Pressable>
          </Row>
          <Row style={{ gap: 12 }}>
            {projects.map(([name, list]) => {
              const remaining = list.filter((t) => t.status !== 'done').length
              const progress = list.length > 0 ? list.filter((t) => t.status === 'done').length : 0
              return (
                <Card key={name} style={{ flex: 1, gap: 12 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row style={{ gap: 8 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="briefcase" size={18} color={theme.colors.text} />
                      </View>
                      <View>
                        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{name}</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{remaining} tarefas restantes</Text>
                      </View>
                    </Row>
                    <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
                  </Row>
                  <Progress value={progress} max={list.length || 1} />
                </Card>
              )
            })}
            {projects.length < 2 ? (
              <Card style={{ flex: 1, gap: 12 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ gap: 8 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="home" size={18} color={theme.colors.text} />
                    </View>
                    <View>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Casa Nova</Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>5 tarefas restantes</Text>
                    </View>
                  </Row>
                  <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
                </Row>
                <Progress value={2} max={5} />
              </Card>
            ) : null}
          </Row>
        </View>
      </ScrollView>
    </Screen>
  )
}
