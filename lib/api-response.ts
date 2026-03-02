// Standardized API response helper for web + mobile consumption
import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  ok?: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

export function success<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  return NextResponse.json({ ok: true, data, meta } satisfies ApiResponse<T>, { status })
}

export function created<T>(data: T) {
  return success(data, undefined, 201)
}

export function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message } satisfies ApiResponse, { status })
}

export function unauthorized(message = 'Nao autorizado') {
  return error(message, 401)
}

export function notFound(message = 'Recurso nao encontrado') {
  return error(message, 404)
}

export function serverError(message = 'Erro interno do servidor') {
  return error(message, 500)
}
