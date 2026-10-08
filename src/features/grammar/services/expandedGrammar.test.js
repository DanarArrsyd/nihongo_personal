import { createHash } from 'node:crypto'
import { createFlashcardDeck } from '../../flashcards/adapters/flashcardDeckAdapter.js'
import { createLibraryCatalog } from '../../library/services/libraryCatalog.js'
import { createGrammarQuestion } from '../../quiz/adapters/grammarQuizAdapter.js'
import { createMixedQuiz } from '../../quiz/adapters/mixedQuizAdapter.js'
import { validateQuestion, validateQuiz } from '../../quiz/services/questionValidation.js'
import { createReviewDeck } from '../../review/services/reviewQueue.js'
import { getGrammar, getGrammarById } from './grammarData.js'

const grammar = getGrammar()
const additions = grammar.slice(12)

describe('expanded Grammar catalogue', () => {
  it('preserves all original 12 records exactly', () => {
    expect(createHash('sha256').update(JSON.stringify(grammar.slice(0, 12))).digest('hex'))
      .toBe('82359bd2835c36b81bf893a25ad65f75d3a95959491b1bc730736363c8b27e6f')
  })

  it('contains 30 unique, complete patterns with valid relationships', () => {
    expect(new Set(grammar.map((item) => item.id)).size).toBe(30)
    expect(new Set(grammar.map((item) => item.pattern)).size).toBe(30)
    grammar.forEach((item, index) => {
      expect(item.id).toBe(`n5-grammar-${String(index + 1).padStart(3, '0')}`)
      for (const key of ['pattern', 'meaning', 'structure', 'explanation']) {
        expect(item[key].trim().length).toBeGreaterThan(0)
      }
      expect(item.jlpt).toBe('N5')
      expect(item.examples.length).toBeGreaterThanOrEqual(2)
      item.examples.forEach((example) => {
        for (const key of ['japanese', 'reading', 'meaning']) {
          expect(example[key].trim().length).toBeGreaterThan(0)
        }
      })
      item.relatedGrammarIds.forEach((id) => {
        expect(getGrammarById(id)).not.toBeNull()
        expect(id).not.toBe(item.id)
      })
    })
  })

  it('creates 36 distinct curated completions that reconstruct their examples', () => {
    const ids = new Set()
    for (const item of additions) {
      expect(item.completionExercises).toHaveLength(2)
      item.completionExercises.forEach((exercise, completionIndex) => {
        const example = item.examples[exercise.exampleIndex]
        expect(exercise.before + exercise.answer + exercise.after).toBe(example.japanese)
        const question = createGrammarQuestion({ item, type: 'sentence_completion', completionIndex, rng: () => 0 })
        expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
        expect(question.instruction).toContain(example.meaning)
        expect(question.options).toHaveLength(4)
        expect(question.source.itemId).toBe(item.id)
        ids.add(question.id)
      })
    }
    expect(ids.size).toBe(36)
  })

  it('rejects malformed or missing curated variations instead of guessing a gap', () => {
    const item = additions[0]
    const create = (record, completionIndex = 0) => createGrammarQuestion({
      item: record, type: 'sentence_completion', completionIndex,
    })
    expect(create(item, 99)).toBeNull()
    expect(create({ ...item, completionExercises: [] })).toBeNull()
    for (const override of [
      { before: 'wrong' }, { exampleIndex: 99 }, { answer: '' },
      { distractors: ['a', 'a', 'b'] }, { distractors: ['a', 'b', ''] },
    ]) {
      expect(create({ ...item, completionExercises: [{ ...item.completionExercises[0], ...override }] })).toBeNull()
    }
  })

  it('supplies Library, flashcards, and SRS from the same catalogue', () => {
    const catalog = createLibraryCatalog().filter((item) => item.category === 'grammar')
    expect(catalog).toHaveLength(30)
    additions.forEach((item) => expect(catalog).toContainEqual(expect.objectContaining({
      id: item.id, href: `/learn/grammar/${item.id}`,
    })))
    const deck = createFlashcardDeck({ module: 'grammar', count: 30, rng: () => 0 })
    expect(deck.error).toBeNull()
    expect(deck.cards).toHaveLength(30)
    const reviews = createReviewDeck(additions.map((item) => ({ itemType: 'grammar', itemId: item.id })))
    expect(reviews).toHaveLength(18)
    reviews.forEach((card, index) => expect(card.front.primary.text).toBe(additions[index].pattern))
  })

  it.each([10, 20, 30])('supports a Grammar-only %i-question completion session', (count) => {
    const result = createMixedQuiz({ count, modules: ['grammar'], questionTypes: ['sentence_completion'], rng: () => 0 })
    expect(result.error).toBeNull()
    expect(result.questions).toHaveLength(count)
    expect(validateQuiz(result.questions)).toEqual({ valid: true, errors: [] })
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(count)
  })

  it('supports 30-question recognition sessions with all expanded patterns', () => {
    const result = createMixedQuiz({ count: 30, modules: ['grammar'], questionTypes: ['recognition'], rng: () => 0 })
    expect(result.error).toBeNull()
    expect(new Set(result.questions.map((question) => question.source.itemId)).size).toBe(30)
    expect(validateQuiz(result.questions).valid).toBe(true)
  })

  it('does not offer interchangeable に and へ for legacy direction questions', () => {
    const result = createMixedQuiz({ count: 20, modules: ['grammar'],
      questionTypes: ['recognition', 'sentence_completion'], sources: { grammar: grammar.slice(0, 12) }, rng: () => 0 })
    expect(result.error).toBeNull()
    const direction = result.questions.find((question) => question.source.itemId === 'n5-grammar-009'
      && question.type === 'sentence_completion')
    expect(direction).toBeDefined()
    expect(direction.options.map((option) => option.value)).not.toContain('に')
    expect(direction.instruction).toContain('Saya pergi ke Jepang.')
  })
})
