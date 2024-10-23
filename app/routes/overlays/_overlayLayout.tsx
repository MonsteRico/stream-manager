import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/_overlayLayout')({
  component: () => <div className='bg-transparent!'><Outlet /></div>,
})
