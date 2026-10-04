import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'

import DailyMissionPage from './DailyMissionPage.jsx'

function createMission(status = 'not_started') {
  const completed = status === 'completed'
  return {
    date: '2026-10-04',
    status,
    tasks: [
      {
        id: 'review', type: 'review', title: 'Review jatuh tempo', route: '/review',
        target: 2, unit: 'item', itemIds: [], completed, completedAt: null,
      },
      {
        id: 'vocabulary', type: 'learn', title: 'Vocabulary baru', route: '/learn/vocabulary',
        target: 5, unit: 'kata', itemIds: ['n5-vocab-001'], completed, completedAt: null,
      },
      {
        id: 'kanji', type: 'learn', title: 'Kanji baru', route: '/learn/kanji',
        target: 2, unit: 'kanji', itemIds: [], completed, completedAt: null,
      },
      {
        id: 'grammar', type: 'learn', title: 'Grammar baru', route: '/learn/grammar',
        target: 1, unit: 'pola', itemIds: [], completed, completedAt: null,
      },
      {
        id: 'practice', type: 'practice', title: 'Mixed Quiz', route: '/practice/mixed',
        target: 10, unit: 'soal', itemIds: [], completed, completedAt: null,
      },
    ],
  }
}

function createMissionHook(initialStatus = 'not_started') {
  return function useMission() {
    const [mission, setMission] = useState(() => createMission(initialStatus))

    return {
      mission,
      status: 'ready',
      retry: vi.fn(),
      start: async () => {
        const started = { ...mission, status: 'in_progress' }
        setMission(started)
        return started
      },
      completeTask: async (taskId) => {
        const tasks = mission.tasks.map((task) => (
          task.id === taskId ? { ...task, completed: true } : task
        ))
        const updated = { ...mission, status: 'in_progress', tasks }
        setMission(updated)
        return updated
      },
    }
  }
}

function renderPage(useMission = createMissionHook()) {
  return render(
    <MemoryRouter>
      <DailyMissionPage useMission={useMission} />
    </MemoryRouter>,
  )
}

describe('DailyMissionPage', () => {
  it('starts a mission and enables persisted task actions', async () => {
    renderPage()

    expect(screen.getByText('Belum dimulai')).toBeVisible()
    expect(screen.getAllByRole('button', { name: 'Tandai selesai' })[0]).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Mulai misi' }))

    expect(await screen.findByText('Sedang berjalan')).toBeVisible()
    const markButtons = screen.getAllByRole('button', { name: 'Tandai selesai' })
    expect(markButtons[0]).toBeEnabled()
    fireEvent.click(markButtons[0])
    expect(await screen.findAllByText('Selesai')).not.toHaveLength(0)
  })

  it('shows one route for every active mission task', () => {
    renderPage(createMissionHook('in_progress'))

    expect(screen.getAllByRole('link', { name: /Buka materi/ })).toHaveLength(5)
  })

  it('keeps a completed mission visible for the same day', () => {
    renderPage(createMissionHook('completed'))

    expect(screen.getByRole('heading', { name: 'Misi hari ini selesai' })).toBeVisible()
    expect(screen.getByRole('progressbar', { name: '5 dari 5 langkah' })).toHaveAttribute('aria-valuenow', '100')
    expect(screen.queryByRole('button', { name: 'Mulai misi' })).not.toBeInTheDocument()
  })
})
