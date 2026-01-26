import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import type { Session } from "@stream-manager/shared";
import { OverwatchCharacters, getGameLogoSrc } from "@stream-manager/shared";
import { cn } from "@/lib/utils";

interface OverwatchMatchOverlayProps {
  session: Session;
}

export function OverwatchMatchOverlay({ session }: OverwatchMatchOverlayProps) {
  const team1BanCharacter = session.team1Ban
    ? OverwatchCharacters.find((char) => char.name === session.team1Ban)
    : null;
  const team2BanCharacter = session.team2Ban
    ? OverwatchCharacters.find((char) => char.name === session.team2Ban)
    : null;

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
            banImage={team1BanCharacter?.image}
          />
          <TeamInfo
            name={session.team2DisplayName}
            icon={session.team2Logo ?? getGameLogoSrc(session.game)}
            score={session.team2Score}
            color={session.team2Color}
            flipped
            delay={session.animationDelay}
            banImage={team2BanCharacter?.image}
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
            banImage={team2BanCharacter?.image}
          />
          <TeamInfo
            name={session.team1DisplayName}
            icon={session.team1Logo ?? getGameLogoSrc(session.game)}
            score={session.team1Score}
            color={session.team1Color}
            flipped
            delay={session.animationDelay}
            banImage={team1BanCharacter?.image}
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
  banImage,
}: {
  name: string;
  icon: string;
  score: number;
  color: string;
  flipped?: boolean;
  delay: number;
  banImage?: string;
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
      initial={{ x: !flipped ? "-100%" : "200%" }}
      transition={{ duration: 0.5, delay }}
    >
      {banImage && (
        <img
          src={banImage}
          alt="Banned hero"
          className="h-10 w-10 object-contain opacity-75"
        />
      )}
      {icon && (
        <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />
      )}
      <span className="text-5xl font-overwatchOblique">{name}</span>
      <span className="text-5xl font-bold font-overwatch">{score}</span>
    </motion.div>
  );
}
