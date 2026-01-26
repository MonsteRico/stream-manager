import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSession } from "@/api/client";
import { getGameLogoSrc } from "@stream-manager/shared";
import BorderAnimation from "@/components/overlay/BorderAnimation";
import { Trophy } from "lucide-react";

export function VictoryPage() {
  const { sessionId, winner } = useParams<{
    sessionId: string;
    winner: string;
  }>();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  if (sessionQuery.isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!sessionQuery.data) {
    return <div className="text-white">Session not found</div>;
  }

  const session = sessionQuery.data;

  const winningTeam = winner === "team1" ? session.team1DisplayName : session.team2DisplayName;
  const winningLogo = winner === "team1" ? session.team1Logo : session.team2Logo;

  return (
    <BorderAnimation>
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: session.animationDelay }}
          className="flex flex-col items-center gap-8 z-30"
        >
          <Trophy className="w-32 h-32 text-yellow-400" />
          <img
            src={winningLogo ?? getGameLogoSrc(session.game)}
            alt={winningTeam}
            className="w-64 h-64 object-contain"
          />
          <h1
            className="text-6xl font-bold text-white font-overwatch"
            style={{
              textShadow:
                "3px 3px 0px #000, -3px -3px 0px #000, 3px -3px 0px #000, -3px 3px 0px #000",
            }}
          >
            {winningTeam}
          </h1>
          <p
            className="text-4xl text-white font-overwatchOblique"
            style={{
              textShadow:
                "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
            }}
          >
            VICTORY
          </p>
        </motion.div>
      </div>
    </BorderAnimation>
  );
}
