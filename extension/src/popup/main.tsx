import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AssistantApp } from '../components/AssistantApp'
import '../styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AssistantApp />
  </StrictMode>,
)
