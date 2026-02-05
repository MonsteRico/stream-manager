import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session, MapInfo } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface DeadlockMatchOverlayProps {
  session: Session;
}

export function DeadlockMatchOverlay({ session }: DeadlockMatchOverlayProps) {
  const mapInfo = session.mapInfo as MapInfo[];

  return (
    <div className="relative w-full flex flex-row !overflow-hidden justify-end">
      {session.team1First && (
        <>
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            color={session.team1Color}
            delay={session.animationDelay}
            bestOf={session.bestOf}
            numMaps={mapInfo.length}
          />
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo ?? getGameLogoSrc(session.game)}
            score={session.team2Score}
            color={session.team2Color}
            numMaps={mapInfo.length}
            flipped
            bestOf={session.bestOf}
            delay={session.animationDelay}
          />
        </>
      )}
      {!session.team1First && (
        <>
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo ?? getGameLogoSrc(session.game)}
            score={session.team2Score}
            numMaps={mapInfo.length}
            color={session.team2Color}
            bestOf={session.bestOf}
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            numMaps={mapInfo.length}
            color={session.team1Color}
            flipped
            bestOf={session.bestOf}
            delay={session.animationDelay}
          />
        </>
      )}
    </div>
  );
}

function TeamInfo({
  name,
  icon,
  score,
  numMaps,
  color,
  delay,
  flipped = false,
  bestOf,
}: {
  name: string;
  icon: string;
  score: number;
  numMaps: number;
  color: string;
  flipped?: boolean;
  delay: number;
  bestOf: boolean;
}) {
  const [scope2, animate2] = useAnimate();

  useEffect(() => {
    animate2(
      scope2.current,
      { x: "0" },
      {
        duration: 0.5,
        delay: delay ?? 0,
      }
    );
  }, [scope2, animate2, delay]);

  return (
    <div className={cn("flex flex-row-reverse w-full", flipped && "flex-row")}>
      <div className="w-[70%]"></div>
      <motion.div
        initial={{
          x: !flipped ? "-300%" : "500%",
        }}
        ref={scope2}
        style={{
          backgroundColor: color,
        }}
        className={cn(
          "flex items-center gap-4 qhd:gap-5 4k:gap-8 w-[30%] h-32 qhd:h-44 4k:h-64 justify-between pr-4 qhd:pr-5 4k:pr-8 pl-2 qhd:pl-3 4k:pl-4",
          flipped && "flex-row-reverse pl-4 qhd:pl-5 4k:pl-8 pr-2 qhd:pr-3 4k:pr-4"
        )}
      >
        <div className="flex flex-col items-center w-full justify-center gap-2 qhd:gap-3 4k:gap-4">
          <div
            className={cn(
              "flex flex-row items-center gap-4 qhd:gap-5 4k:gap-8 w-full justify-between",
              flipped && "flex-row-reverse"
            )}
          >
            {icon && (
              <img
                src={icon}
                alt={`${name} logo`}
                className="h-12 qhd:h-16 4k:h-24 w-auto py-1 qhd:py-1.5 4k:py-2"
              />
            )}
            <span className={cn("text-3xl qhd:text-4xl 4k:text-6xl w-full float-right text-center")}>
              {name}
            </span>
          </div>
          <div className="w-full flex flex-row gap-2 qhd:gap-3 4k:gap-4 justify-evenly">
            {Array.from({ length: score }).map((_, index) => (
              <div
                key={index}
                className="bg-white h-4 w-4 qhd:h-5 qhd:w-5 4k:h-8 4k:w-8 rounded-full"
              ></div>
            ))}
            {Array.from({
              length: (bestOf ? Math.round(numMaps / 2) : numMaps) - score,
            }).map((_, index) => (
              <div
                key={index}
                className="border-2 border-white h-4 w-4 qhd:h-5 qhd:w-5 4k:h-8 4k:w-8 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
