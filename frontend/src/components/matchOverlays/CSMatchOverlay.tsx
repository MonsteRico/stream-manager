import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface CSMatchOverlayProps {
  session: Session;
}

export function CSMatchOverlay({ session }: CSMatchOverlayProps) {
  return (
    <div className="relative w-full flex flex-row justify-evenly !overflow-hidden">
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
        "flex items-center gap-4 qhd:gap-5 4k:gap-8 mt-4 qhd:mt-5 4k:mt-8 w-[19.5%] h-12 qhd:h-16 4k:h-24 justify-between pr-4 qhd:pr-5 4k:pr-8 pl-2 qhd:pl-3 4k:pl-4",
        flipped && "flex-row-reverse pl-4 qhd:pl-5 4k:pl-8 pr-2 qhd:pr-3 4k:pr-4"
      )}
      initial={{ x: !flipped ? "-100%" : "200%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, delay }}
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
      <span className="text-4xl qhd:text-5xl 4k:text-8xl">{score}</span>
    </motion.div>
  );
}
