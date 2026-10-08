import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import { BACKUP_FORMAT, BACKUP_TABLES, BACKUP_VERSION, getBackupSummary } from '../../services/dataBackup.js'
import DataSafetyPage from './DataSafetyPage.jsx'

const backup = {
  format: BACKUP_FORMAT,
  backupVersion: BACKUP_VERSION,
  databaseVersion: 2,
  exportedAt: '2026-10-08T02:00:00.000Z',
  tables: Object.fromEntries(BACKUP_TABLES.map((tableName) => [tableName, []])),
}

backup.tables.progress.push({ itemType: 'vocabulary', itemId: 'n5-vocab-001' })
backup.tables.settings.push({ key: 'dailyGoal', value: 20 })

function renderPage(props = {}) {
  return render(
    <MemoryRouter>
      <DataSafetyPage {...props} />
    </MemoryRouter>,
  )
}

describe('DataSafetyPage', () => {
  it('downloads a generated backup with success feedback', async () => {
    const createBackup = vi.fn().mockResolvedValue(backup)
    const downloadBackup = vi.fn()
    renderPage({ createBackup, downloadBackup })

    fireEvent.click(screen.getByRole('button', { name: 'Unduh backup sekarang' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Backup berhasil diunduh')
    expect(createBackup).toHaveBeenCalledOnce()
    expect(downloadBackup).toHaveBeenCalledWith(backup)
  })

  it('previews a valid file and requires explicit confirmation before restore', async () => {
    const parseBackup = vi.fn().mockReturnValue(backup)
    const readFile = vi.fn().mockResolvedValue(JSON.stringify(backup))
    const restoreBackup = vi.fn().mockResolvedValue(getBackupSummary(backup))
    renderPage({ parseBackup, readFile, restoreBackup })

    const file = new File(['backup'], 'nihongo-backup.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('Pilih file backup JSON'), { target: { files: [file] } })

    expect(await screen.findByText('Backup siap dipulihkan')).toBeVisible()
    expect(screen.getByText('2 record')).toBeVisible()
    expect(restoreBackup).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Pulihkan backup ini' }))
    expect(screen.getByRole('heading', { name: 'Ganti seluruh data lokal?' })).toBeVisible()
    expect(restoreBackup).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Ya, pulihkan data' }))
    await waitFor(() => expect(restoreBackup).toHaveBeenCalledWith(backup))
    expect(await screen.findByRole('status')).toHaveTextContent('2 record berhasil dipulihkan')
  })

  it('rejects an invalid file without exposing the restore action', async () => {
    const readFile = vi.fn().mockResolvedValue('{broken')
    const parseBackup = vi.fn().mockImplementation(() => {
      throw new Error('File backup bukan JSON yang valid.')
    })
    renderPage({ parseBackup, readFile })

    fireEvent.change(screen.getByLabelText('Pilih file backup JSON'), {
      target: { files: [new File(['broken'], 'broken.json', { type: 'application/json' })] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent('File backup bukan JSON yang valid.')
    expect(screen.queryByRole('button', { name: 'Pulihkan backup ini' })).not.toBeInTheDocument()
  })

  it('reports a failed restore while preserving the stated safety guarantee', async () => {
    const restoreBackup = vi.fn().mockRejectedValue(new Error('disk failed'))
    renderPage({
      parseBackup: vi.fn().mockReturnValue(backup),
      readFile: vi.fn().mockResolvedValue(JSON.stringify(backup)),
      restoreBackup,
    })

    fireEvent.change(screen.getByLabelText('Pilih file backup JSON'), {
      target: { files: [new File(['backup'], 'backup.json', { type: 'application/json' })] },
    })
    await screen.findByText('Backup siap dipulihkan')
    fireEvent.click(screen.getByRole('button', { name: 'Pulihkan backup ini' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ya, pulihkan data' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Data lama tetap dipertahankan')
    })
  })
})
