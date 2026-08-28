import { Outlet } from 'react-router-dom'
import VocabularySessionProvider from './VocabularySessionProvider'

export default function VocabularyLayout() {
  return (
    <VocabularySessionProvider>
      <Outlet />
    </VocabularySessionProvider>
  )
}
