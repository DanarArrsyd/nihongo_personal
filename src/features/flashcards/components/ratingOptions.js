import { Check, Dumbbell, RefreshCcw, Sparkles } from 'lucide-react'

export const RATING_OPTIONS = [
  {
    value: 'again',
    label: 'Again',
    shortcut: '1',
    description: 'Belum ingat',
    icon: RefreshCcw,
    iconClass: 'text-accent',
  },
  {
    value: 'hard',
    label: 'Hard',
    shortcut: '2',
    description: 'Masih sulit',
    icon: Dumbbell,
    iconClass: 'text-gold',
  },
  {
    value: 'good',
    label: 'Good',
    shortcut: '3',
    description: 'Cukup ingat',
    icon: Check,
    iconClass: 'text-blue-muted',
  },
  {
    value: 'easy',
    label: 'Easy',
    shortcut: '4',
    description: 'Langsung ingat',
    icon: Sparkles,
    iconClass: 'text-matcha',
  },
]
