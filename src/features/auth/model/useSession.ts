import { useSyncExternalStore } from 'react'
import { authSession } from '../../../shared/api/authSession'

export function useSession() {
  return useSyncExternalStore(authSession.subscribe, authSession.getSnapshot)
}
