export interface CrudService<T> {
  fetchAll: () => Promise<T[]>
  fetchById?: (id: string) => Promise<T>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
}


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | null = null
  const stored = typeof window !== 'undefined' && localStorage.getItem('auth')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      token = parsed.token ?? null
    } catch {
      token = null
    }
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  if (!res.ok) {
    let errorData
    try {
      errorData = await res.json()
    } catch {
      errorData = { message: await res.text() || res.statusText }
    }

    const error = new Error(errorData.message || res.statusText) as any
    error.response = {
      status: res.status,
      data: errorData
    }
    throw error
  }

  if (res.status === 204) {
    return undefined as any
  }

  return (await res.json()) as T
}

export function createCrudService<T>(resource: string): CrudService<T> {
  const base = `${API_BASE}/${resource}`
  return {
    fetchAll: () => request<T[]>(base),
    fetchById: (id: string) => request<T>(`${base}/${id}`),
    create: (data: Partial<T>) =>
      request<T>(base, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<T>) =>
      request<T>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<void>(`${base}/${id}`, { method: 'DELETE' })
  }
}
