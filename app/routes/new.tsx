// app/routes/index.tsx
import { db } from '@/db'
import { sessionsTable } from '@/db/schema'
import { startSession } from '@/lib/serverFunctions'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { eq } from 'drizzle-orm'
import { useEffect } from 'react'

export const Route = createFileRoute('/new')({
  component: New,
})

function New() {
  const router = useRouter()

  useEffect(() => {
    async function effect() {
    if (localStorage.getItem('sessionId')) {
      const sessionId = localStorage.getItem('sessionId')
      router.navigate({
        to: `/session/${sessionId}`,
      })
    }
    else {
      const newSession = await startSession()
      localStorage.setItem('sessionId', newSession.id)
      router.navigate({
        to: `/session/${newSession.id}`,
      })
    }}
    effect()
  })

  return (
    <div>
      Making a new session...

    </div>
  )
}
