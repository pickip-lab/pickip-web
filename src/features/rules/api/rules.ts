import { apiRequest, jsonBody } from '../../../shared/api/client'
import type { Provider } from '../../connections/api/connections'

export type Category = 'DECISION' | 'IDEA' | 'ISSUE' | 'BOOKMARK'
export type Rule = { id: number; emoji: string; category: Category; createdAt: string; updatedAt: string }
export type RuleInput = { emoji: string; category: Category }

export const categoryNames: Record<Category, string> = { DECISION: '결정', IDEA: '아이디어', ISSUE: '이슈', BOOKMARK: '북마크' }
export const categories = Object.keys(categoryNames) as Category[]

const root = (id: number) => `/platform-connections/${id}/reaction-rules`
export const listRules = (id: number) => apiRequest<Rule[]>(root(id))
export const createRule = (id: number, input: RuleInput) => apiRequest<Rule>(root(id), { method: 'POST', ...jsonBody(input) })
export const updateRule = (id: number, ruleId: number, input: RuleInput) => apiRequest<Rule>(`${root(id)}/${ruleId}`, { method: 'PUT', ...jsonBody(input) })
export const deleteRule = (id: number, ruleId: number) => apiRequest<void>(`${root(id)}/${ruleId}`, { method: 'DELETE' })

const presetEmojis: Record<Provider, Record<Category, string>> = {
  SLACK: { DECISION: 'white_check_mark', IDEA: 'bulb', ISSUE: 'bug', BOOKMARK: 'pushpin' },
  DISCORD: { DECISION: '✅', IDEA: '💡', ISSUE: '🐛', BOOKMARK: '📌' },
  MATTERMOST: { DECISION: 'white_check_mark', IDEA: 'bulb', ISSUE: 'bug', BOOKMARK: 'pushpin' },
}
export const displayEmojis: Record<Category, string> = { DECISION: '✅', IDEA: '💡', ISSUE: '🐛', BOOKMARK: '📌' }
export const presetEmoji = (provider: Provider, category: Category) => presetEmojis[provider][category]
