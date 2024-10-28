import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/overlays/_overlay/$sessionId/victory/$winner',
)({
  loader: async ({ params: { sessionId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      sessionQueryOptions(sessionId),
    )
    if (!data) {
      throw redirect({
        to: '/',
      })
    }
  },
  notFoundComponent: () => {
    return <NotFound>Session not found</NotFound>
  },
  component: VictoryOverlay,
})

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NotFound } from '@/components/NotFound'
import { sessionQueryOptions } from '@/lib/serverFunctions'
import { useSuspenseQuery } from '@tanstack/react-query'

function VictoryOverlay() {
  const { sessionId, winner } = Route.useParams()
  const sessionQuery = useSuspenseQuery({
    ...sessionQueryOptions(sessionId),
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  if (!sessionQuery.data) {
    return <NotFound>Session not found</NotFound>
  }

  const session = sessionQuery.data
  const teamName =
    winner === 'team1' ? session.team1DisplayName : session.team2DisplayName
  const teamColor = winner === 'team1' ? session.team1Color : session.team2Color
  const teamLogo = winner === 'team1' ? session.team1Logo : session.team2Logo
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    // const timer = setTimeout(() => setShow(false), 5000); // Hide after 5 seconds
    // return () => clearTimeout(timer);
  }, [])

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: show ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{ backgroundColor: teamColor, backdropFilter: 'blur(10px)' }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="mb-8"
        >
          <img
            src={teamLogo ?? ''}
            alt={`${teamName} logo`}
            width={200}
            height={200}
            className="mx-auto"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-6xl font-bold text-white mb-4"
        >
          {teamName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-3xl text-white"
        >
          Wins the Match!
        </motion.p>
      </div>
    </motion.div>
  )
}
