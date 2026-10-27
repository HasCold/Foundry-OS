import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerDomainIntegrations } from './app/domainIntegrations'

// Wire cross-module event subscriptions (Procurement/Scheduler/Quality -> Finance)
// exactly once, before the app renders. See domainIntegrations.ts for why this
// indirection exists instead of stores importing each other directly.
registerDomainIntegrations()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
