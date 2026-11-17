import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { App } from './app/App'
import { queryClient } from './app/queryClient'
import './app/styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('앱 루트 요소를 찾을 수 없습니다.')
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter><App /></BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
