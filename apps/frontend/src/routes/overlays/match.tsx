import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSession } from "@/api/client";

// Match overlay components (will be created)
import { OverwatchMatchOverlay } from "@/components/matchOverlays/OverwatchMatchOverlay";
import { ValorantMatchOverlay } from "@/components/matchOverlays/ValorantMatchOverlay";
import { CSMatchOverlay } from "@/components/matchOverlays/CSMatchOverlay";
import { LeagueOfLegendsMatchOverlay } from "@/components/matchOverlays/LeagueOfLegendsMatchOverlay";
import { SmashMatchOverlay } from "@/components/matchOverlays/SmashMatchOverlay";
import { DeadlockMatchOverlay } from "@/components/matchOverlays/DeadlockOverlay";
import { RivalsMatchOverlay } from "@/components/matchOverlays/RivalsMatchOverlay";
import { GenericMatchOverlay } from "@/components/matchOverlays/GenericMatchOverlay";

export function MatchOverlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

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

  switch (session.game) {
    case "Overwatch":
      return <OverwatchMatchOverlay session={session} />;
    case "Rocket League":
      return <p className="text-white">You should be using BARL</p>;
    case "Smash":
      return <SmashMatchOverlay session={session} />;
    case "Valorant":
      return <ValorantMatchOverlay session={session} />;
    case "CS":
      return <CSMatchOverlay session={session} />;
    case "League of Legends":
      return <LeagueOfLegendsMatchOverlay session={session} />;
    case "Deadlock":
      return <DeadlockMatchOverlay session={session} />;
    case "Marvel Rivals":
      return <RivalsMatchOverlay session={session} />;
    default:
      return <GenericMatchOverlay session={session} />;
  }
}
