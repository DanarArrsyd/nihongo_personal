import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GrammarDetailPage from './GrammarDetailPage'

vi.mock('./services/grammarData', () => ({
  getGrammarById: () => ({
    id: 'n5-grammar-missing-reading',
    pattern: '～です',
    meaning: 'adalah',
    jlpt: 'N5',
    structure: 'Noun + です',
    explanation: 'Pola sopan untuk menyatakan identitas atau keadaan.',
    examples: [
      {
        japanese: '私は学生です。',
        meaning: 'Saya adalah pelajar.',
      },
    ],
  }),
  getRelatedGrammar: () => [],
}))

describe('GrammarDetailPage', () => {
  it('labels a missing example reading while showing an em dash fallback', () => {
    render(
      <MemoryRouter initialEntries={['/learn/grammar/n5-grammar-missing-reading']}>
        <Routes>
          <Route path="/learn/grammar/:grammarId" element={<GrammarDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Bacaan tidak tersedia')).toHaveTextContent('—')
  })
})
