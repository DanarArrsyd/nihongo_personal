import { render, screen } from '@testing-library/react'
import Badge from './Badge'
import Button from './Button'
import Card from './Card'
import ProgressBar from './ProgressBar'
import EmptyState from '../feedback/EmptyState'
import LoadingState from '../feedback/LoadingState'

describe('design-system primitives', () => {
  it('uses a safe button type by default', () => {
    render(<Button>Continue</Button>)

    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('type', 'button')
  })

  it('exposes card content through an optional labelled region', () => {
    render(<Card aria-label="Study summary">Summary</Card>)

    expect(screen.getByRole('region', { name: 'Study summary' })).toHaveTextContent('Summary')
  })

  it('communicates badge meaning with text', () => {
    render(<Badge variant="success">Ready</Badge>)

    expect(screen.getByText('Ready')).toBeVisible()
  })

  it('exposes labelled progress and clamps invalid values', () => {
    render(<ProgressBar label="Daily goal" value={140} />)

    const progress = screen.getByRole('progressbar', { name: 'Daily goal' })
    expect(progress).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('100%')).toBeVisible()
  })

  it('gives empty states a clear optional action', () => {
    render(
      <EmptyState
        title="Nothing here yet"
        description="Start a lesson to create activity."
        action={<Button>Start learning</Button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start learning' })).toBeInTheDocument()
  })

  it('announces loading without exposing decorative skeletons', () => {
    render(<LoadingState label="Loading study workspace" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading study workspace')
    expect(screen.getByTestId('loading-skeletons')).toHaveAttribute('aria-hidden', 'true')
  })
})
