import * as SecureStore from 'expo-secure-store'
import { api } from './http'

export async function login(email: string, password: string) {
  const res = await api.post('/api/auth/login', { email, password })
  const { user, token } = res.data.data
  await SecureStore.setItemAsync('iris-token', token)
  return user
}

export async function logout() {
  await api.post('/api/auth/logout')
  await SecureStore.deleteItemAsync('iris-token')
}

export async function me() {
  const res = await api.get('/api/auth/me')
  return res.data.data.user
}
