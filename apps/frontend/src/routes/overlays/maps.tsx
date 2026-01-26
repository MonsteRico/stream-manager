import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSession } from "@/api/client";
import type { MapInfo } from "@stream-manager/shared";
import { OverwatchCharacters, getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";
import BigScore from "@/components/overlay/BigScore";

const placeholderMaps = [
  "/images/randomPurdueLocations/arches.jpg",
  "/images/randomPurdueLocations/belltower.jpg",
  "/images/randomPurdueLocations/blockp.jpg",
  "/images/randomPurdueLocations/engineering.JPG",
  "/images/randomPurdueLocations/loeb.jpg",
];

export function MapsOverlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  const [visibleMaps, setVisibleMaps] = useState<MapInfo[]>([]);

  const session = sessionQuery.data;
  const maps = (session?.mapInfo as MapInfo[]) || [];

  useEffect(() => {
    if (maps.length === 0) return;
    
    const timer = setInterval(() => {
      if (visibleMaps.length < maps.length) {
        setVisibleMaps((prev) => [...prev, maps[prev.length]]);
      } else {
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [maps, visibleMaps.length]);

  if (sessionQuery.isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!session) {
    return <div className="text-white">Session not found</div>;
  }

  const nextMapIndex = maps.findIndex((map) => map.winner === null);
  const previousMapIndex = maps.findIndex((map) => map.winner === null) - 1;

  return (
    <div className="w-screen p-4 rounded-lg shadow-lg bg-[url(/images/puggMousepad2.png)] bg-no-repeat bg-cover h-screen !overflow-hidden">
      <BigScore session={session} />
      <div className="flex flex-row px-8 w-full h-full">
        {maps.map((map, index) => (
          <motion.div
            initial={{
              opacity: 0,
              width: index === previousMapIndex ? "120%" : "100%",
              y: 50,
            }}
            animate={
              index < visibleMaps.length
                ? {
                    opacity: 1,
                    y: 0,
                    width:
                      index === previousMapIndex
                        ? "100%"
                        : index === nextMapIndex
                          ? "120%"
                          : "100%",
                  }
                : {
                    width:
                      index === previousMapIndex
                        ? "100%"
                        : index === nextMapIndex
                          ? "120%"
                          : "100%",
                  }
            }
            transition={{
              opacity: { duration: 0.5, delay: session.animationDelay },
              width: {
                duration: 0.5,
                delay:
                  session.animationDelay +
                  (visibleMaps.length === maps.length ? 0 : 0.25 * maps.length) +
                  0.5,
              },
              y: { duration: 0.5, delay: session.animationDelay },
            }}
            key={map.id}
            className={cn(
              "relative h-[75%] w-full overflow-hidden",
              index !== 0 && "border-l-4 border-gray-800"
            )}
            style={{
              backgroundImage: `url('${map.name && map.image ? map.image : placeholderMaps[index % placeholderMaps.length]}')`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!map.image && (
              <div className="h-full w-full bg-black opacity-75 z-0"></div>
            )}
            {!map.winner && !map.image && (
              <div className="h-full w-full p-16 flex items-center justify-center z-10 absolute top-0 left-0">
                <img
                  src="/images/esap.png"
                  alt="Purdue Esports"
                  className="z-10 w-32 h-32"
                />
              </div>
            )}
            {map.winner && (
              <div
                style={{
                  backgroundColor: `rgba(${hexToRgb(map.winner === "team1" ? session.team1Color : session.team2Color)?.r || 0}, ${hexToRgb(map.winner === "team1" ? session.team1Color : session.team2Color)?.g || 0}, ${hexToRgb(map.winner === "team1" ? session.team1Color : session.team2Color)?.b || 0}, 0.4)`,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img
                  src={
                    (map.winner === "team1"
                      ? session.team1Logo
                      : session.team2Logo) ?? getGameLogoSrc(session.game)
                  }
                  alt={`${map.winner === "team1" ? session.team1DisplayName : session.team2DisplayName} logo`}
                  className="w-[75%] h-[75%] object-contain px-4"
                />
              </div>
            )}
            {gameHasMaps(session.game) && (
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-70 p-2 text-white flex items-center justify-between",
                  index % 2 === 0 && "bg-gray-800"
                )}
              >
                <div>
                  <h3 className="text-lg font-bold">{map.name || "TBD"}</h3>
                  {map.mode && <p className="text-sm">{map.mode}</p>}
                </div>
                {session.game === "Overwatch" &&
                  (map.team1Ban || map.team2Ban) && (
                    <div className="flex items-center gap-3">
                      {map.team1Ban &&
                        (() => {
                          const banChar = OverwatchCharacters.find(
                            (char) => char.name === map.team1Ban
                          );
                          return banChar ? (
                            <img
                              src={banChar.image}
                              alt={map.team1Ban}
                              className="h-12 w-12 object-contain opacity-75"
                              title={`${session.team1DisplayName} banned ${map.team1Ban}`}
                            />
                          ) : null;
                        })()}
                      {map.team2Ban &&
                        (() => {
                          const banChar = OverwatchCharacters.find(
                            (char) => char.name === map.team2Ban
                          );
                          return banChar ? (
                            <img
                              src={banChar.image}
                              alt={map.team2Ban}
                              className="h-12 w-12 object-contain opacity-75"
                              title={`${session.team2DisplayName} banned ${map.team2Ban}`}
                            />
                          ) : null;
                        })()}
                    </div>
                  )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function gameHasMaps(game: string | null) {
  switch (game) {
    case "Overwatch":
    case "Splatoon":
    case "Valorant":
    case "CS":
    case "Marvel Rivals":
      return true;
    default:
      return false;
  }
}
