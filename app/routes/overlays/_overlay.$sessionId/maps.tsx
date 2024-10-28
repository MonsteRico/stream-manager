import { useState, useEffect, useRef } from 'react'
import { motion, useAnimate } from 'framer-motion'
import type { MapInfo } from '@/db/schema'
import { NotFound } from '@/components/NotFound'
import { sessionQueryOptions } from '@/lib/serverFunctions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import BigScore from '@/components/BigScore'

const placeholderImage =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'

const placeholderMaps = [
  '/images/randomPurdueLocations/arches.jpg',
  '/images/randomPurdueLocations/belltower.jpg',
  '/images/randomPurdueLocations/blockp.jpg',
  '/images/randomPurdueLocations/engineering.JPG',
  '/images/randomPurdueLocations/loeb.jpg',
]

export const Route = createFileRoute('/overlays/_overlay/$sessionId/maps')({
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
  component: MapOverlay,
})

export default function MapOverlay() {
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

  const maps = session.mapInfo as MapInfo[]

  const [visibleMaps, setVisibleMaps] = useState<MapInfo[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      if (visibleMaps.length < maps.length) {
        setVisibleMaps((prev) => [...prev, maps[prev.length]])
      } else {
        clearInterval(timer)
        setTimeout(mapChangeAnimation, 500)
      }
    }, 250) // Adjust timing as needed

    return () => clearInterval(timer)
  }, [maps, visibleMaps])

  // find the index of the first map with null winner
  const nextMapIndex = maps.findIndex((map) => map.winner === null)
  let previousMapIndex = maps.findIndex((map) => map.winner === null) - 1

  const [previousMapRef, animate] = useAnimate()
  const [nextMapRef, nextAnimate] = useAnimate()

  async function mapChangeAnimation() {
    if (previousMapIndex >= 0) {
      animate(
        previousMapRef.current,
        { width: ['120%', '100%'] },
        {
          duration: 0.75,
        },
      )
    }
    nextAnimate(
      nextMapRef.current,
      { width: ['100%', '120%'] },
      {
        duration: 0.75,
      },
    )
  }

  return (
    <div className="w-screen p-4 rounded-lg shadow-lg bg-[url(/images/puggMousepad2.png)] bg-no-repeat bg-cover h-screen !overflow-hidden">
      <BigScore {...session} />
      <div className="flex flex-row px-8 w-full h-full">
        {maps.map((map, index) => (
          <motion.div
            ref={
              index == nextMapIndex
                ? nextMapRef
                : index == previousMapIndex
                  ? previousMapRef
                  : null
            }
            initial={{ opacity: 0, y: 50 }}
            animate={index < visibleMaps.length ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            key={map.id}
            className={cn(
              'relative h-[75%] w-full overflow-hidden',
              index == previousMapIndex && 'w-[120%]',
              index != 0 && 'border-l-4 border-gray-800',
            )}
            style={{
              backgroundImage: `url(${map.name && map.image ? map.image : placeholderMaps[index % placeholderMaps.length]})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!map.image && (
              <div className="h-full w-full bg-black opacity-75 z-0"></div>
            )}
            {!map.image && (
              <div className="h-full w-full p-16 flex items-center justify-center z-10 absolute top-0 left-0">
                <img
                  src="/images/purdueEsports.png"
                  alt="Purdue Esports"
                  className="z-10"
                />
              </div>
            )}
            {map.winner && (
              <div
                style={{
                  backgroundColor: `rgba(${hexToRgb(map.winner === 'team1' ? session.team1Color : session.team2Color)!.r}, ${hexToRgb(map.winner === 'team1' ? session.team1Color : session.team2Color)!.g}, ${hexToRgb(map.winner === 'team1' ? session.team1Color : session.team2Color)!.b}, 0.4)`,
                }}
                className={`absolute inset-0 flex items-center justify-center`}
              >
                <img
                  src={
                    (map.winner == 'team1'
                      ? session.team1Logo
                      : session.team2Logo) ?? ''
                  }
                  alt={`${map.winner == 'team1' ? session.team1DisplayName : session.team2DisplayName} logo`}
                  className="w-[75%] h-[75%] object-contain px-4"
                />
              </div>
            )}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-70 p-2 text-white',
                index % 2 == 0 && 'bg-gray-800',
              )}
            >
              <h3 className="text-lg font-bold">{map.name || 'TBD'}</h3>
              {map.mode && <p className="text-sm">{map.mode}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}
