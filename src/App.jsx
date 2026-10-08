import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LoadingState from './components/feedback/LoadingState'
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

const DailyMissionPage = lazy(() => import('./features/missions/DailyMissionPage'))
const DataSafetyPage = lazy(() => import('./features/data-safety/DataSafetyPage'))
const KanaWritingPage = lazy(() => import('./features/writing/KanaWritingPage'))
const LibraryPage = lazy(() => import('./features/library/LibraryPage'))
const ProgressPage = lazy(() => import('./features/progress/ProgressPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route
          path="/mission"
          element={(
            <Suspense fallback={<div className="page-frame"><LoadingState label="Memuat Daily Mission" /></div>}>
              <DailyMissionPage />
            </Suspense>
          )}
        />
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
        <Route
          path="/practice/writing/kana/:script/:kanaId?"
          element={(
            <Suspense fallback={<div className="page-frame"><LoadingState label="Memuat latihan menulis" /></div>}>
              <KanaWritingPage />
            </Suspense>
          )}
        />
        <Route path="/review" element={<ReviewPage />} />
        <Route
          path="/data-safety"
          element={(
            <Suspense fallback={<div className="page-frame"><LoadingState label="Memuat Data Safety" /></div>}>
              <DataSafetyPage />
            </Suspense>
          )}
        />
        <Route
          path="/progress"
          element={(
            <Suspense fallback={<div className="page-frame"><LoadingState label="Memuat progress belajar" /></div>}>
              <ProgressPage />
            </Suspense>
          )}
        />
        <Route
          path="/library"
          element={(
            <Suspense fallback={<div className="page-frame"><LoadingState label="Memuat library" /></div>}>
              <LibraryPage />
            </Suspense>
          )}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
