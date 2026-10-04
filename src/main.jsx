import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/geist'
import '@fontsource-variable/noto-sans-jp'
import './styles/index.css'
import App from './App'
import PersistenceProvider from './features/persistence/PersistenceProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PersistenceProvider>
        <App />
      </PersistenceProvider>
    </BrowserRouter>
  </StrictMode>,
)
