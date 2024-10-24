import { createFileRoute, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '@/lib/serverFunctions'
import { NotFound } from '@/components/NotFound'
import { useSuspenseQuery } from '@tanstack/react-query'
import CasterInfoCard from '@/components/CasterInfoCard'
import type { CasterInfo } from '@/db/schema'
import BorderAnimation from '@/components/BorderAnimation'
import MovingDots from '@/components/MovingDots'

export const Route = createFileRoute(
  '/overlays/$sessionId/castersSingleCamera',
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
  component: SingleCamCastersOverlay,
})

function SingleCamCastersOverlay() {
  const { sessionId } = Route.useParams()
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
  const casters = session.casters as CasterInfo[]

  return (
      <BorderAnimation>
          <div className="flex flex-col items-center justify-center my-auto">
              <div className="flex h-full w-full z-30 flex-col items-baseline relative overflow-hidden">
                  <div className="w-[90dvw] h-[90dvh] bg-secondary rounded-lg ">
                      {/* Placeholder for camera feed */}
                      <div className="w-full h-full flex items-center justify-center text-secondary-foreground">Camera Feed</div>
                  </div>
                  <div className="flex flex-row inset-0 absolute h-full justify-between items-end">
                      {casters.map((caster: CasterInfo, index) => (
                          <CasterInfoCard key={index} {...caster} showSocials={false} />
                      ))}
                  </div>
              </div>
              <MovingDots
                  backgroundColor="#d1d3d4"
                  startX={614}
                  startY={520}
                  endX={1225}
                  endY={240}
                  numDots={3}
                  repeatDelay={1.5}
                  staggerDelay={0.2}
              />
          </div>
      </BorderAnimation>
  );
}
