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
        "flex items-center gap-4 mt-4 w-[19.5%] h-12 justify-between pr-4 pl-2",
        flipped && "flex-row-reverse pl-4 pr-2"
      )}
      initial={{ x: !flipped ? "-100%" : "200%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        className={cn(
          "flex flex-row items-center gap-4",
          flipped && "flex-row-reverse"
        )}
      >
        {icon && (
          <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />
        )}
        <span className="text-3xl">{name}</span>
      </div>
      <span className="text-4xl">{score}</span>
    </motion.div>
  );
}
