import {
  BarChart3,
  BookOpen,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Learn', path: '/learn', icon: GraduationCap },
  { label: 'Practice', path: '/practice', icon: Dumbbell },
  { label: 'Review', path: '/review', icon: RotateCcw },
  { label: 'Progress', path: '/progress', icon: BarChart3 },
  { label: 'Library', path: '/library', icon: BookOpen },
]
