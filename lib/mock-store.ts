"use client"

// Simple localStorage-backed mock store for frontend-only flows

export type MockNotification = {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  is_read?: boolean
  related_goal_id?: string | number | null
}

export type InviteStatus = 'pending' | 'accepted' | 'declined'

const NOTIF_KEY = 'commitly_mock_notifications'
const INVITE_PARTNER_KEY = 'commitly_mock_invites_partner'
const INVITE_GROUP_KEY = 'commitly_mock_invites_group'
const ENCOURAGEMENTS_KEY = 'commitly_mock_encouragements'

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function getNotifications(): MockNotification[] {
  return safeRead<MockNotification[]>(NOTIF_KEY, [])
}

export function addNotification(n: Omit<MockNotification, 'id' | 'created_at' | 'is_read'> & Partial<Pick<MockNotification,'is_read'>>) {
  const all = getNotifications()
  const id = Math.random().toString(36).slice(2)
  const created_at = new Date().toISOString()
  const next: MockNotification = { id, created_at, is_read: false, ...n }
  all.unshift(next)
  safeWrite(NOTIF_KEY, all)
}

export function getInviteStatus(role: 'partner' | 'group', goalId: string | number): InviteStatus | undefined {
  const key = role === 'partner' ? INVITE_PARTNER_KEY : INVITE_GROUP_KEY
  const map = safeRead<Record<string, InviteStatus>>(key, {})
  return map[String(goalId)]
}

export function setInviteStatus(role: 'partner' | 'group', goalId: string | number, status: InviteStatus) {
  const key = role === 'partner' ? INVITE_PARTNER_KEY : INVITE_GROUP_KEY
  const map = safeRead<Record<string, InviteStatus>>(key, {})
  map[String(goalId)] = status
  safeWrite(key, map)
}

export type EncouragementMessage = {
  id: string
  authorName: string
  content: string
  timestamp: string
}

export function getEncouragements(goalId: string | number): EncouragementMessage[] {
  const map = safeRead<Record<string, EncouragementMessage[]>>(ENCOURAGEMENTS_KEY, {})
  return map[String(goalId)] || []
}

export function addEncouragement(goalId: string | number, content: string, authorName: string) {
  const map = safeRead<Record<string, EncouragementMessage[]>>(ENCOURAGEMENTS_KEY, {})
  const id = Math.random().toString(36).slice(2)
  const timestamp = new Date().toISOString()
  const msg: EncouragementMessage = { id, authorName, content, timestamp }
  const cur = map[String(goalId)] || []
  map[String(goalId)] = [msg, ...cur]
  safeWrite(ENCOURAGEMENTS_KEY, map)
}
