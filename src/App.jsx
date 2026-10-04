import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './features/dashboard/DashboardPage'
import FlashcardsPage from './features/flashcards/FlashcardsPage'
import FlashcardSessionPage from './features/flashcards/FlashcardSessionPage'
import GrammarDetailPage from './features/grammar/GrammarDetailPage'
import GrammarPage from './features/grammar/GrammarPage'
import KanaLearningPage, { KanaEntryRedirect } from './features/kana/KanaLearningPage'
import KanaPracticePage from './features/kana/KanaPracticePage'
import KanjiDetailPage from './features/kanji/KanjiDetailPage'
import KanjiPage from './features/kanji/KanjiPage'
import LearnPage from './features/learn/LearnPage'
import PracticePage from './features/practice/PracticePage'
import MixedQuizPage from './features/quiz/MixedQuizPage'
import ReviewPage from './features/review/ReviewPage'
import VocabularyDetailPage from './features/vocabulary/VocabularyDetailPage'
import VocabularyLayout from './features/vocabulary/VocabularyLayout'
import VocabularyPage from './features/vocabulary/VocabularyPage'
import NotFoundPage from './pages/NotFoundPage'
import PagePlaceholder from './pages/PagePlaceholder'

const pages = [
  {
    path: '/progress',
    title: 'Progress',
    japanese: '進捗',
    index: '05',
    description: 'A measured view of consistency, mastery, and study history.',
  },
  {
    path: '/library',
    title: 'Library',
    japanese: '資料',
    index: '06',
    description: 'Reference material stays organized and easy to revisit.',
  },
]

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/kana/:script" element={<KanaEntryRedirect />} />
        <Route path="/learn/kana/:script/:groupId" element={<KanaLearningPage />} />
        <Route path="/learn/kanji" element={<KanjiPage />} />
        <Route path="/learn/kanji/:kanjiId" element={<KanjiDetailPage />} />
        <Route path="/learn/grammar" element={<GrammarPage />} />
        <Route path="/learn/grammar/:grammarId" element={<GrammarDetailPage />} />
        <Route path="/learn/vocabulary" element={<VocabularyLayout />}>
          <Route index element={<VocabularyPage />} />
          <Route path=":vocabularyId" element={<VocabularyDetailPage />} />
        </Route>
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/mixed" element={<MixedQuizPage />} />
        <Route path="/practice/flashcards" element={<FlashcardsPage />} />
        <Route path="/practice/flashcards/:module" element={<FlashcardSessionPage />} />
        <Route path="/practice/kana/:script/:mode" element={<KanaPracticePage />} />
        <Route path="/review" element={<ReviewPage />} />
        {pages.map((page) => (
          <Route key={page.path} path={page.path} element={<PagePlaceholder {...page} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
