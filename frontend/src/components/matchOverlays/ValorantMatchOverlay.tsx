import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session, MapInfo } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface ValorantMatchOverlayProps {
  session: Session;
}

export function ValorantMatchOverlay({ session }: ValorantMatchOverlayProps) {
  const mapInfo = session.mapInfo as MapInfo[];

  return (
    <div className="relative w-full flex flex-row !overflow-hidden">
      {session.team1First && (
        <>
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            bestOf={session.bestOf}
            color={session.team1Color}
            delay={session.animationDelay}
            numMaps={mapInfo.length}
          />
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo ?? getGameLogoSrc(session.game)}
            score={session.team2Score}
            bestOf={session.bestOf}
            color={session.team2Color}
            flipped
            numMaps={mapInfo.length}
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
            color={session.team2Color}
            bestOf={session.bestOf}
            numMaps={mapInfo.length}
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            color={session.team1Color}
            numMaps={mapInfo.length}
            bestOf={session.bestOf}
            flipped
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
  color,
  delay,
  bestOf,
  flipped = false,
  numMaps,
}: {
  name: string;
  icon: string;
  score: number;
  color: string;
  flipped?: boolean;
  bestOf: boolean;
  numMaps: number;
  delay: number;
}) {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();

  useEffect(() => {
    animate1(
      scope1.current,
      { x: "0" },
      {
        duration: 0.5,
        delay: delay ?? 0,
      }
    );
    animate2(
      scope2.current,
      { x: "0" },
      {
        duration: 0.5,
        delay: delay ?? 0,
      }
    );
  }, [scope1, scope2, animate1, animate2, delay]);

  return (
    <div className={cn("flex flex-row-reverse w-1/2", flipped && "flex-row")}>
      <motion.div
        initial={{
          x: !flipped ? "-300%" : "500%",
        }}
        style={{
          backgroundColor: color,
        }}
        className={cn("flex items-center gap-4 qhd:gap-5 4k:gap-8 w-full h-6 qhd:h-8 4k:h-12")}
        ref={scope1}
      ></motion.div>
      <motion.div
        initial={{
          x: !flipped ? "-300%" : "500%",
        }}
        ref={scope2}
        style={{
          backgroundColor: color,
        }}
        className={cn(
          "flex items-center gap-4 qhd:gap-5 4k:gap-8 w-[60%] h-16 qhd:h-20 4k:h-32 justify-between pr-4 qhd:pr-5 4k:pr-8 pl-2 qhd:pl-3 4k:pl-4",
          flipped && "flex-row-reverse pl-4 qhd:pl-5 4k:pl-8 pr-2 qhd:pr-3 4k:pr-4"
        )}
      >
        <div
          className={cn(
            "flex flex-row items-center gap-4 qhd:gap-5 4k:gap-8",
            flipped && "flex-row-reverse"
          )}
        >
          {icon && (
            <img src={icon} alt={`${name} logo`} className="h-12 qhd:h-16 4k:h-24 w-auto py-1 qhd:py-1.5 4k:py-2" />
          )}
          <span className="text-3xl qhd:text-4xl 4k:text-6xl">{name}</span>
        </div>
        {Array.from({ length: score }).map((_, index) => (
          <div key={index} className="bg-white h-4 w-4 qhd:h-5 qhd:w-5 4k:h-8 4k:w-8 rounded-full"></div>
        ))}
        {Array.from({
          length: (bestOf ? Math.round(numMaps / 2) : numMaps) - score,
        }).map((_, index) => (
          <div
            key={index}
            className="border-2 border-white h-4 w-4 qhd:h-5 qhd:w-5 4k:h-8 4k:w-8 rounded-full"
          ></div>
        ))}
      </motion.div>
    </div>
  );
}
