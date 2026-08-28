import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import SectionHeading from './SectionHeading'

export default function RecentActivity({ activities }) {
  return (
    <Card aria-label="Recent activity" className="h-full">
      <SectionHeading eyebrow="Study log" title="Recent activity" />
      <ol className="mt-6 divide-y divide-border">
        {activities.map((activity) => (
          <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <Badge variant={activity.type === 'Review' ? 'success' : 'neutral'}>{activity.type}</Badge>
              <time className="text-[0.68rem] text-ink-muted">{activity.time}</time>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">{activity.title}</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">{activity.detail}</p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
