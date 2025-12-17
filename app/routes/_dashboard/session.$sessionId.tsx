import { type Session } from "@/db/schema";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import MatchMapsDashboard from "@/components/dashboard/MapDashboard";
import { CSMaps, DefaultMaps, MarvelRivalsMaps, OverwatchMaps, SplatoonMaps, ValorantMaps } from "@/lib/maps";
import OverlaysDash from "@/components/dashboard/OverlaysDash";
import CasterDashboard from "@/components/dashboard/CasterDashboard";
import { NotFound } from "@/components/NotFound";
import { useUpdateSessionMutation } from "@/lib/utils";
import SessionInfoDash from "@/components/dashboard/SessionInfoDash";
import EditTeamsDash from "@/components/dashboard/EditTeamsDash";
import BansDashboard from "@/components/dashboard/BansDashboard";

export const Route = createFileRoute("/_dashboard/session/$sessionId")({
	loader: async ({ params: { sessionId }, context }) => {
		const data = await context.queryClient.ensureQueryData(sessionQueryOptions(sessionId));
		if (!data) {
			throw redirect({
				to: "/",
			});
		}
	},
	notFoundComponent: () => {
		return <NotFound>Session not found</NotFound>;
	},
	component: SessionDashboard,
});

function SessionDashboard() {
	const { sessionId } = Route.useParams();
	const sessionQuery = useSuspenseQuery({
		...sessionQueryOptions(sessionId),
		refetchInterval: 30000,
		refetchOnWindowFocus: true,
		refetchIntervalInBackground: true,
	});

	if (!sessionQuery.data) {
		return <NotFound>Session not found</NotFound>;
	}

	const [session, setSession] = useState<Session>(sessionQuery.data);
	const { mutate, mutateAsync } = useUpdateSessionMutation(sessionId, {
		onMutate: (variables) => {
			setSession({ ...session, ...variables });
			console.log("THE SSSION UPDATED");
		},
	});

	// Sync session state with query data when it changes (e.g., from API calls)
	useEffect(() => {
		if (sessionQuery.data) {
			setSession(sessionQuery.data);
		}
	}, [sessionQuery.data]);

	return (
		<div className="container mx-auto p-4">
			<div className="space-y-6 container mx-auto p-4">
				<SessionInfoDash session={session} mutateFn={mutate} />
				<EditTeamsDash session={session} mutateFn={mutate} mutateAsyncFn={mutateAsync} />

				{session.game === "Overwatch" && (
					<>
						<MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...OverwatchMaps]} mutateFn={mutate} />
						<BansDashboard sessionId={sessionId} mutateFn={mutate} />
					</>
				)}
				{session.game === "Splatoon" && (
					<MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...SplatoonMaps]} mutateFn={mutate} />
				)}
				{session.game === "Valorant" && (
					<MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...ValorantMaps]} mutateFn={mutate} />
				)}
				{session.game === "CS" && <MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...CSMaps]} mutateFn={mutate} />}
				{session.game === "League of Legends" && (
					<MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...DefaultMaps]} mutateFn={mutate} />
				)}
				{session.game === "Marvel Rivals" && (
					<MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...MarvelRivalsMaps]} mutateFn={mutate} />
				)}
				{session.game === "Deadlock" && <MatchMapsDashboard sessionId={sessionId} gameMaps={[{ id: 0, name: "TBD", image: "", mode: null, winner: null }, ...DefaultMaps]} mutateFn={mutate} />}
				<CasterDashboard sessionId={sessionId} mutateFn={mutate} />
				<OverlaysDash sessionId={sessionId} team1DisplayName={session.team1DisplayName} team2DisplayName={session.team2DisplayName} game={session.game} />
			</div>
		</div>
	);
}
