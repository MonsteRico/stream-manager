import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/manageCasters')({
  component: () => <div>Hello /_dashboard/manageCasters!</div>,
})
