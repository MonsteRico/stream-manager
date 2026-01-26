import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface SmashMatchOverlayProps {
  session: Session;
}

export function SmashMatchOverlay({ session }: SmashMatchOverlayProps) {
  return (
    <div className="relative w-full flex flex-row justify-center !overflow-hidden">
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
        "flex items-center gap-4 mt-4 w-[29.5%] h-12 justify-end pr-4",
        flipped && "flex-row-reverse justify-end pl-4 pr-0"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {icon && (
        <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />
      )}
      <span className="text-4xl">{name}</span>
      <span className="text-4xl font-bold">{score}</span>
    </motion.div>
  );
}
