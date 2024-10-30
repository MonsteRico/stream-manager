import { createFileRoute, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '@/lib/serverFunctions'
import { NotFound } from '@/components/NotFound'
import { useSuspenseQuery } from '@tanstack/react-query'
import CasterInfoCard from '@/components/overlay/CasterInfoCard'
import type { CasterInfo } from '@/db/schema'
import BorderAnimation from '@/components/overlay/BorderAnimation'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute(
  '/overlays/_overlay/$sessionId/castersSingleCamera',
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

  const placeholderRef = useRef<HTMLDivElement>(null)
  const [clipPath, setClipPath] = useState('')

  // Function to calculate clip-path based on the placeholder's boundaries
  useEffect(() => {
    if (placeholderRef.current) {
      const { top, left, width, height } =
        placeholderRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Convert pixel values to percentages for clip-path
      const topPercent = (top / viewportHeight) * 100
      const leftPercent = (left / viewportWidth) * 100
      const bottomPercent = ((top + height) / viewportHeight) * 100
      const rightPercent = ((left + width) / viewportWidth) * 100

      // Define a polygon that cuts out the placeholder area
      const newClipPath = `polygon(0% 0%, 0% 100%, ${leftPercent}% 100%, ${leftPercent}% ${topPercent}%, ${rightPercent}% ${topPercent}%, ${rightPercent}% ${bottomPercent}%, ${leftPercent}% ${bottomPercent}%, ${leftPercent}% 100%, 100% 100%, 100% 0%)`

      setClipPath(newClipPath)
    }
  }, [])

  return (
    <BorderAnimation clippath={clipPath}>
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="flex h-full w-full z-30 flex-col items-baseline relative overflow-hidden">
          <div
            ref={placeholderRef}
            className="w-[90%] h-[90%] bg-secondary rounded-lg "
          >
            {/* Placeholder for camera feed */}
            <div className="w-full h-full flex items-center justify-center text-secondary-foreground flex-col">
              <p>Camera Feed</p>
            </div>
          </div>
          <div className="flex flex-row inset-0 absolute h-full justify-between items-end">
            {casters.map((caster: CasterInfo, index) => (
              <CasterInfoCard key={index} {...caster} showSocials={false} />
            ))}
          </div>
        </div>
      </div>
    </BorderAnimation>
  )
}
