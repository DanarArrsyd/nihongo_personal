import { useRef, useState } from 'react'
import { ArrowLeft, Download, FileJson, ShieldCheck, TriangleAlert, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button.jsx'
import {
  createDataBackup,
  getBackupSummary,
  MAX_BACKUP_FILE_BYTES,
  parseDataBackup,
  restoreDataBackup,
} from '../../services/dataBackup.js'

const tableLabels = {
  progress: 'Progress',
  reviews: 'Review',
  quizHistory: 'Riwayat quiz',
  studySessions: 'Sesi belajar',
  favorites: 'Favorit',
  settings: 'Pengaturan',
  dailyMissions: 'Daily Mission',
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function downloadDataBackup(backup) {
  const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `nihongo-personal-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function BackupSummary({ backup }) {
  const summary = getBackupSummary(backup)

  return (
    <div className="mt-5 rounded-2xl border border-border bg-paper-deep/55 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Backup siap dipulihkan</p>
          <p className="mt-1 text-sm font-semibold text-ink">{dateFormatter.format(new Date(summary.exportedAt))}</p>
        </div>
        <span className="rounded-full bg-matcha-soft px-3 py-1 text-xs font-semibold text-matcha">
          {summary.totalRecords} record
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        {Object.entries(summary.tableCounts).map(([tableName, count]) => (
          <div key={tableName}>
            <dt className="text-xs text-ink-muted">{tableLabels[tableName]}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-ink">{count}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function DataSafetyPage({
  createBackup = createDataBackup,
  downloadBackup = downloadDataBackup,
  parseBackup = parseDataBackup,
  readFile = (file) => file.text(),
  restoreBackup = restoreDataBackup,
}) {
  const fileInputRef = useRef(null)
  const [isBusy, setIsBusy] = useState(false)
  const [pendingBackup, setPendingBackup] = useState(null)
  const [pendingFileName, setPendingFileName] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [notice, setNotice] = useState(null)

  const exportBackup = async () => {
    setIsBusy(true)
    setNotice(null)

    try {
      const backup = await createBackup()
      downloadBackup(backup)
      setNotice({ type: 'success', message: 'Backup berhasil diunduh. Simpan file ini di tempat yang aman.' })
    } catch {
      setNotice({ type: 'error', message: 'Backup belum dapat dibuat. Coba lagi tanpa menutup aplikasi.' })
    } finally {
      setIsBusy(false)
    }
  }

  const selectBackup = async (event) => {
    const [file] = event.target.files ?? []
    event.target.value = ''
    setPendingBackup(null)
    setPendingFileName('')
    setIsConfirming(false)
    setNotice(null)

    if (!file) return

    if (file.size > MAX_BACKUP_FILE_BYTES) {
      setNotice({ type: 'error', message: 'File backup melebihi batas 5 MB.' })
      return
    }

    setIsBusy(true)
    try {
      const backup = parseBackup(await readFile(file))
      setPendingBackup(backup)
      setPendingFileName(file.name)
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'File backup tidak valid.' })
    } finally {
      setIsBusy(false)
    }
  }

  const restoreBackupData = async () => {
    if (!pendingBackup) return
    setIsBusy(true)
    setNotice(null)

    try {
      const summary = await restoreBackup(pendingBackup)
      setPendingBackup(null)
      setPendingFileName('')
      setIsConfirming(false)
      setNotice({
        type: 'success',
        message: `${summary.totalRecords} record berhasil dipulihkan. Progress terbaru siap digunakan.`,
      })
    } catch {
      setIsConfirming(false)
      setNotice({ type: 'error', message: 'Restore gagal. Data lama tetap dipertahankan.' })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="page-frame">
      <Link
        to="/progress"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" size={17} /> Kembali ke Progress
      </Link>

      <header className="mt-7 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-matcha-soft text-matcha">
            <ShieldCheck aria-hidden="true" size={22} />
          </span>
          <div>
            <p className="font-japanese text-sm font-semibold text-accent">データ保護</p>
            <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">V1.1 Data Safety</p>
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">Backup & restore</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
          Progress hanya tersimpan di browser ini. Unduh backup secara berkala agar riwayat belajar dapat dipulihkan jika perangkat atau penyimpanan browser berubah.
        </p>
      </header>

      {notice ? (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${
            notice.type === 'error'
              ? 'border-accent/30 bg-accent-soft text-[#8F3531]'
              : 'border-matcha/25 bg-matcha-soft text-[#516549]'
          }`}
        >
          {notice.message}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="export-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(64,54,41,0.05)] sm:p-7">
          <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
            <Download aria-hidden="true" size={20} />
          </span>
          <h2 id="export-heading" className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink">Unduh backup</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Simpan progress, review, quiz, sesi belajar, favorit, pengaturan, dan Daily Mission dalam satu file JSON.
          </p>
          <Button className="mt-7 w-full sm:w-auto" disabled={isBusy} onClick={exportBackup}>
            <Download aria-hidden="true" size={17} /> {isBusy ? 'Memproses…' : 'Unduh backup sekarang'}
          </Button>
        </section>

        <section aria-labelledby="restore-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(64,54,41,0.05)] sm:p-7">
          <span className="grid size-10 place-items-center rounded-xl bg-paper-deep text-gold">
            <Upload aria-hidden="true" size={20} />
          </span>
          <h2 id="restore-heading" className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink">Pulihkan data</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            File diperiksa sebelum restore. Data browser saat ini baru diganti setelah Anda mengonfirmasi.
          </p>

          <input
            ref={fileInputRef}
            aria-label="Pilih file backup JSON"
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={selectBackup}
          />
          <Button
            className="mt-7 w-full sm:w-auto"
            disabled={isBusy}
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileJson aria-hidden="true" size={17} /> {isBusy ? 'Memeriksa…' : 'Pilih file backup'}
          </Button>

          {pendingBackup ? (
            <>
              <p className="mt-4 truncate text-xs text-ink-muted">File: {pendingFileName}</p>
              <BackupSummary backup={pendingBackup} />

              {isConfirming ? (
                <div role="alert" className="mt-5 rounded-2xl border border-accent/30 bg-accent-soft p-4 sm:p-5">
                  <div className="flex gap-3">
                    <TriangleAlert aria-hidden="true" className="mt-0.5 shrink-0 text-accent" size={19} />
                    <div>
                      <h3 className="font-semibold text-ink">Ganti seluruh data lokal?</h3>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        Progress di browser ini akan diganti oleh isi backup. Proses tidak dapat dibatalkan tanpa backup lain.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button disabled={isBusy} variant="secondary" onClick={() => setIsConfirming(false)}>Batal</Button>
                    <Button disabled={isBusy} onClick={restoreBackupData}>
                      {isBusy ? 'Memulihkan…' : 'Ya, pulihkan data'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button className="mt-5 w-full sm:w-auto" disabled={isBusy} onClick={() => setIsConfirming(true)}>
                  <Upload aria-hidden="true" size={17} /> Pulihkan backup ini
                </Button>
              )}
            </>
          ) : null}
        </section>
      </div>

      <aside className="mt-6 flex gap-3 rounded-2xl border border-border bg-paper-deep/65 p-4 sm:p-5">
        <TriangleAlert aria-hidden="true" className="mt-0.5 shrink-0 text-gold" size={19} />
        <p className="text-sm leading-6 text-ink-muted">
          Backup berisi riwayat belajar pribadi. Simpan file secara privat dan jangan mengedit isinya secara manual.
        </p>
      </aside>
    </div>
  )
}

