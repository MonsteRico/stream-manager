import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface RivalsMatchOverlayProps {
  session: Session;
}

export function RivalsMatchOverlay({ session }: RivalsMatchOverlayProps) {
  return (
    <div className="relative w-full flex flex-row justify-between !overflow-hidden">
      {session.team1First && (
        <>
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            color={session.team1Color}
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo ?? getGameLogoSrc(session.game)}
            score={session.team2Score}
            color={session.team2Color}
            flipped
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
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            color={session.team1Color}
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
  flipped = false,
}: {
  name: string;
  icon: string;
  score: number;
  color: string;
  flipped?: boolean;
  delay: number;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      scope.current,
      { x: "0" },
      {
        duration: 0.5,
        delay: delay ?? 0,
      }
    );
  }, [scope, animate, delay]);

  return (
    <motion.div
      ref={scope}
      style={{
        backgroundColor: color,
      }}
      className={cn(
        "flex items-center gap-4 qhd:gap-5 4k:gap-8 mt-4 qhd:mt-5 4k:mt-8 w-[29.5%] h-12 qhd:h-16 4k:h-24 justify-end pr-4 qhd:pr-5 4k:pr-8",
        flipped && "flex-row-reverse justify-end pl-4 qhd:pl-5 4k:pl-8 pr-0"
      )}
      initial={{ x: !flipped ? "-100%" : "200%" }}
      transition={{ duration: 0.5, delay }}
    >
      {icon && (
        <img src={icon} alt={`${name} logo`} className="h-12 qhd:h-16 4k:h-24 w-auto py-1 qhd:py-1.5 4k:py-2" />
      )}
      <span className="text-5xl qhd:text-6xl 4k:text-10xl font-overwatchOblique">{name}</span>
      <span className="text-5xl qhd:text-6xl 4k:text-10xl font-bold font-overwatch">{score}</span>
    </motion.div>
  );
}
