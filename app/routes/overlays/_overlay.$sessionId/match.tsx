import { NotFound } from "@/components/NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, useAnimate } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn, getGameLogoSrc } from "@/lib/utils";
import { ValorantMatchOverlay } from "@/components/matchOverlays/ValorantMatchOverlay";
import { GenericMatchOverlay } from "@/components/matchOverlays/GenericMatchOverlay";
import { LeagueOfLegendsMatchOverlay } from "@/components/matchOverlays/LeagueOfLegendsMatchOverlay";
import { CSMatchOverlay } from "@/components/matchOverlays/CSMatchOverlay";
import { SmashMatchOverlay } from "@/components/matchOverlays/SmashMatchOverlay";
import { OverwatchMatchOverlay } from "@/components/matchOverlays/OverwatchMatchOverlay";

export const Route = createFileRoute("/overlays/_overlay/$sessionId/match")({
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
    component: MatchOverlay,
});

function MatchOverlay() {
    const router = useRouter();
    const { sessionId } = Route.useParams();
    const sessionQuery = useSuspenseQuery({
        ...sessionQueryOptions(sessionId),
        refetchInterval: 1000,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: true,
    });

    if (!sessionQuery.data) {
        return <NotFound>Session not found</NotFound>;
    }

    const session = sessionQuery.data;

    switch (session.game) {
        case "Overwatch":
            return <OverwatchMatchOverlay route={Route} />;
        case "Rocket League":
            return <p>You should be using BARL</p>;
        case "Smash":
            return <SmashMatchOverlay route={Route} />;
        case "Valorant":
            return <ValorantMatchOverlay route={Route} />;
        case "CS":
            return <CSMatchOverlay route={Route} />;
        case "League of Legends":
            return <LeagueOfLegendsMatchOverlay route={Route} />;
        default:
            return <GenericMatchOverlay route={Route} />;
    }
}





