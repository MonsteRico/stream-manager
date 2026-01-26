import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchSession, updateSession } from "@/api/client";
import type { Session } from "@stream-manager/shared";
import {
  OverwatchMaps,
  SplatoonMaps,
  ValorantMaps,
  CSMaps,
  DefaultMaps,
  MarvelRivalsMaps,
} from "@stream-manager/shared";

// Dashboard components (will be created next)
import SessionInfoDash from "@/components/dashboard/SessionInfoDash";
import EditTeamsDash from "@/components/dashboard/EditTeamsDash";
import MapDashboard from "@/components/dashboard/MapDashboard";
import BansDashboard from "@/components/dashboard/BansDashboard";
import CasterDashboard from "@/components/dashboard/CasterDashboard";
import OverlaysDash from "@/components/dashboard/OverlaysDash";

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const [session, setSession] = useState<Session | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Session>) => updateSession(sessionId!, data),
    onMutate: (variables) => {
      if (session) {
        setSession({ ...session, ...variables });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });

  // Sync session state with query data
  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data);
    }
  }, [sessionQuery.data]);

  // Handle session not found
  useEffect(() => {
    if (sessionQuery.isError) {
      localStorage.removeItem("sessionId");
      navigate("/");
    }
  }, [sessionQuery.isError, navigate]);

  if (sessionQuery.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">Session not found</div>
      </div>
    );
  }

  const getGameMaps = () => {
    const tbdMap = { id: 0, name: "TBD", image: "", mode: null, winner: null };
    switch (session.game) {
      case "Overwatch":
        return [tbdMap, ...OverwatchMaps];
      case "Splatoon":
        return [tbdMap, ...SplatoonMaps];
      case "Valorant":
        return [tbdMap, ...ValorantMaps];
      case "CS":
        return [tbdMap, ...CSMaps];
      case "Marvel Rivals":
        return [tbdMap, ...MarvelRivalsMaps];
      default:
        return [tbdMap, ...DefaultMaps];
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6 container mx-auto p-4">
        <SessionInfoDash
          session={session}
          mutateFn={updateMutation.mutate}
        />
        <EditTeamsDash
          session={session}
          mutateFn={updateMutation.mutate}
          mutateAsyncFn={updateMutation.mutateAsync}
        />

        {(session.game === "Overwatch" ||
          session.game === "Splatoon" ||
          session.game === "Valorant" ||
          session.game === "CS" ||
          session.game === "League of Legends" ||
          session.game === "Marvel Rivals" ||
          session.game === "Deadlock") && (
          <MapDashboard
            sessionId={sessionId!}
            gameMaps={getGameMaps()}
            mutateFn={updateMutation.mutate}
          />
        )}

        {session.game === "Overwatch" && (
          <BansDashboard
            sessionId={sessionId!}
            mutateFn={updateMutation.mutate}
          />
        )}

        <CasterDashboard
          sessionId={sessionId!}
          mutateFn={updateMutation.mutate}
        />

        <OverlaysDash
          sessionId={sessionId!}
          team1DisplayName={session.team1DisplayName}
          team2DisplayName={session.team2DisplayName}
          game={session.game}
        />
      </div>
    </div>
  );
}
