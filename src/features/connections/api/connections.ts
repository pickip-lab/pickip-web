import { apiRequest } from '../../../shared/api/client'

export type Provider = 'SLACK' | 'DISCORD' | 'MATTERMOST'
export type ConnectionStatus = 'CONNECTED' | 'ERROR' | 'DISCONNECTED'
export type Connection = {
  id: number
  provider: Provider
  workspaceId: string
  workspaceName: string
  status: ConnectionStatus
  connectedAt: string
  disconnectedAt: string | null
  errorCode: string | null
  errorAt: string | null
}

export const providers: Record<Provider, { name: string; initial: string; description: string }> = {
  SLACK: { name: 'Slack', initial: 'S', description: '워크스페이스 메시지를 골라 담기' },
  DISCORD: { name: 'Discord', initial: 'D', description: '서버의 대화를 모아 보기' },
  MATTERMOST: { name: 'Mattermost', initial: 'M', description: '팀 대화를 놓치지 않기' },
}

export const providerKeys = Object.keys(providers) as Provider[]

export function listConnections() {
  return apiRequest<Connection[]>('/platform-connections')
}

export function beginConnection(provider: Provider) {
  return apiRequest<{ authorizationUrl: string }>(`/platform-connections/${provider.toLowerCase()}/web/authorize`, { method: 'POST' })
}

export function disconnectConnection(id: number) {
  return apiRequest<void>(`/platform-connections/${id}`, { method: 'DELETE' })
}
