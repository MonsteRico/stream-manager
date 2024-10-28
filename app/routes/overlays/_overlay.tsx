import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/_overlay')({
  component: () => <main className='bg-transparent'><Outlet /></main>,
})
