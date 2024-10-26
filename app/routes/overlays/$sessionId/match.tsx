import { NotFound } from "@/components/NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/overlays/$sessionId/match")({
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

    return (
        <div className="relative w-full h-12 flex flex-row !bg-white">
            {session.team1First && (
                <>
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo}
                        score={session.team1Score}
                        color={session.team1Color}
                    />
                    <TeamInfo
                        name={session.team2DisplayName}
                        icon={session.team2Logo}
                        score={session.team2Score}
                        color={session.team2Color}
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
                    />
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo}
                        score={session.team1Score}
                        color={session.team1Color}
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
}: {
    name: string;
    icon: string | undefined | null;
    score: number;
    color: string;
    flipped?: boolean;
}) {
    return (
        <motion.div
            style={{
                backgroundColor: color,
            }}
            className={cn("flex items-center gap-4 w-1/2 justify-end pr-4", flipped && "flex-row-reverse justify-end pl-4 pr-0")}
            initial={{ x: !flipped ? "-100%" : "200%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
        >
            {icon && <img src={icon} alt={`${name} logo`} className="w-10 h-10" />}
            <span className="text-4xl font-semibold font-overwatchOblique">{name}</span>
            <span className="text-4xl font-overwatch">{score}</span>
        </motion.div>
    );
}
