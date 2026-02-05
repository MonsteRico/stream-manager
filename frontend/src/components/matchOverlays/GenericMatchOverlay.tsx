import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface GenericMatchOverlayProps {
  session: Session;
}

export function GenericMatchOverlay({ session }: GenericMatchOverlayProps) {
  return (
    <div className="relative w-full h-12 qhd:h-16 4k:h-24 flex flex-row">
      {session.team1First && (
        <>
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo}
            score={session.team1Score}
            color={session.team1Color}
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo}
            score={session.team2Score}
            color={session.team2Color}
            delay={session.animationDelay}
            flipped
          />
        </>
      )}
      {!session.team1First && (
        <>
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo}
            score={session.team2Score}
            color={session.team2Color}
            delay={session.animationDelay}
          />
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo}
            score={session.team1Score}
            color={session.team1Color}
            delay={session.animationDelay}
            flipped
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
  flipped = false,
  delay,
}: {
  name: string;
  icon: string | undefined | null;
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
        "flex items-center gap-4 qhd:gap-5 4k:gap-8 w-1/2 justify-end pr-4 qhd:pr-5 4k:pr-8",
        flipped && "flex-row-reverse justify-end pl-4 qhd:pl-5 4k:pl-8 pr-0"
      )}
      initial={{ x: !flipped ? "-100%" : "200%" }}
    >
      {icon && <img src={icon} alt={`${name} logo`} className="w-10 h-10 qhd:w-14 qhd:h-14 4k:w-20 4k:h-20" />}
      <span className="text-4xl qhd:text-5xl 4k:text-8xl font-semibold font-overwatchOblique">{name}</span>
      <span className="text-4xl qhd:text-5xl 4k:text-8xl font-overwatch">{score}</span>
    </motion.div>
  );
}
