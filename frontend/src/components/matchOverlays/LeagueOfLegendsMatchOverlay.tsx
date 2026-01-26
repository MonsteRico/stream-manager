import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface LeagueOfLegendsMatchOverlayProps {
  session: Session;
}

export function LeagueOfLegendsMatchOverlay({
  session,
}: LeagueOfLegendsMatchOverlayProps) {
  return (
    <div className="absolute bottom-[14.5rem] w-full justify-center flex flex-row !overflow-hidden">
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
        "flex items-center gap-4 w-[34%] h-12 justify-end pr-4",
        flipped && "flex-row-reverse justify-end pl-4 pr-0"
      )}
      initial={{ x: !flipped ? "-100%" : "200%" }}
      transition={{ duration: 0.5, delay }}
    >
      {icon && (
        <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />
      )}
      <span className="text-5xl font-overwatchOblique">{name}</span>
      <span className="text-5xl font-bold font-overwatch">{score}</span>
    </motion.div>
  );
}
