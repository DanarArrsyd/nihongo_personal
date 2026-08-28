export const dashboardData = {
  profile: {
    greeting: 'おはようございます。',
    welcome: 'Welcome back.',
    level: 'JLPT N5',
  },
  dailyGoal: {
    current: 18,
    target: 20,
    unit: 'minutes',
  },
  streak: {
    days: 12,
    best: 18,
  },
  mission: [
    {
      id: 'review',
      label: 'Review',
      description: 'Strengthen what you already know.',
      items: ['18 items'],
    },
    {
      id: 'learn',
      label: 'Learn',
      description: 'Add a small, focused set.',
      items: ['5 Vocabulary', '2 Kanji', '1 Grammar'],
    },
    {
      id: 'practice',
      label: 'Practice',
      description: 'Finish with active recall.',
      items: ['10 Questions'],
    },
  ],
  statistics: [
    { id: 'vocabulary', label: 'Vocabulary mastered', value: 126, accent: 'red' },
    { id: 'kanji', label: 'Kanji mastered', value: 38, accent: 'matcha' },
    { id: 'grammar', label: 'Grammar mastered', value: 17, accent: 'gold' },
    { id: 'reviews', label: 'Reviews due today', value: 18, accent: 'blue' },
  ],
  weeklyActivity: [
    { day: 'Mon', minutes: 14 },
    { day: 'Tue', minutes: 22 },
    { day: 'Wed', minutes: 18 },
    { day: 'Thu', minutes: 30 },
    { day: 'Fri', minutes: 16 },
    { day: 'Sat', minutes: 25 },
    { day: 'Sun', minutes: 18 },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'Review',
      title: 'Vocabulary review',
      detail: '12 items · 92% accuracy',
      time: 'Today, 08:10',
    },
    {
      id: 'activity-2',
      type: 'Learn',
      title: 'Hiragana vowels',
      detail: '5 characters introduced',
      time: 'Yesterday, 19:40',
    },
    {
      id: 'activity-3',
      type: 'Practice',
      title: 'Mixed practice',
      detail: '10 questions · 80% accuracy',
      time: '26 Aug, 20:15',
    },
  ],
}
