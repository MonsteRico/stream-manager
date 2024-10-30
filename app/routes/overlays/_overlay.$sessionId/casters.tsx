import { createFileRoute, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '@/lib/serverFunctions'
import { NotFound } from '@/components/NotFound'
import { useSuspenseQuery } from '@tanstack/react-query'
import CasterInfoCard from '@/components/overlay/CasterInfoCard'
import type { CasterInfo } from '@/db/schema'
import BorderAnimation from '@/components/overlay/BorderAnimation'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/overlays/_overlay/$sessionId/casters')({
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
  component: CastersOverlay,
})

function CastersOverlay() {
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

  const placeholderOneRef = useRef<HTMLDivElement>(null)
  const placeholderTwoRef = useRef<HTMLDivElement>(null)
  const [clipPath, setClipPath] = useState('')

  // Function to calculate clip-path based on the placeholder's boundaries
  useEffect(() => {
    if (placeholderOneRef.current && placeholderTwoRef.current) {
      const {
        top: topOne,
        left: leftOne,
        width: widthOne,
        height: heightOne,
      } = placeholderOneRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Convert pixel values to percentages for clip-path
      const topOnePercent = (topOne / viewportHeight) * 100
      const leftOnePercent = (leftOne / viewportWidth) * 100
      const bottomOnePercent = ((topOne + heightOne) / viewportHeight) * 100
      const rightOnePercent = ((leftOne + widthOne) / viewportWidth) * 100

      const {
        top: topTwo,
        left: leftTwo,
        width: widthTwo,
        height: heightTwo,
      } = placeholderTwoRef.current.getBoundingClientRect()
      const topTwoPercent = (topTwo / viewportHeight) * 100
      const leftTwoPercent = (leftTwo / viewportWidth) * 100
      const bottomTwoPercent = ((topTwo + heightTwo) / viewportHeight) * 100
      const rightTwoPercent = ((leftTwo + widthTwo) / viewportWidth) * 100

      // Define a polygon that cuts out the placeholder area
      const newClipPath = `polygon(0% 0%, 0% 100%, ${leftOnePercent}% 100%, ${leftOnePercent}% ${topOnePercent}%, ${rightOnePercent}% ${topOnePercent}%, ${rightOnePercent}% ${bottomOnePercent}%, ${leftOnePercent}% ${bottomOnePercent}%, ${leftOnePercent}% 100%, ${leftTwoPercent}% 100%, ${leftTwoPercent}% ${topTwoPercent}%, ${rightTwoPercent}% ${topTwoPercent}%, ${rightTwoPercent}% ${bottomTwoPercent}%, ${leftTwoPercent}% ${bottomTwoPercent}%, ${leftTwoPercent}% 100%, 100% 100%, 100% 0%)`

      setClipPath(newClipPath)
    }
  }, [])

  const cameraWidth = window.innerWidth * 0.33
  const cameraHeight = window.innerHeight * 0.7

  return (
    <BorderAnimation clippath={clipPath}>
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="flex h-full w-full z-30 flex-row items-baseline gap-8">
          {casters.map((caster: CasterInfo, index) => (
            <div className="flex flex-col items-center" key={index}>
              <div
                className={`bg-secondary mb-2 rounded-lg overflow-hidden`}
                ref={index == 0 ? placeholderOneRef : placeholderTwoRef}
                style={{
                  width: cameraWidth,
                  height: cameraHeight,
                }}
              >
                {/* Placeholder for camera feed */}
                <div className="w-full h-full flex items-center justify-center text-secondary-foreground">
                  Camera Feed
                </div>
              </div>
              <CasterInfoCard {...caster} />
            </div>
          ))}
        </div>
      </div>
    </BorderAnimation>
  )
}
