import { NotFound } from "@/components/NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

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
        <div className="relative w-full h-screen bg-black bg-opacity-30">
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute top-0 left-0 right-0 flex justify-between items-center bg-gray-800 bg-opacity-80 text-white p-4"
            >
                <TeamInfo name={session.team1DisplayName} icon={session.team1Logo} score={session.team1Score} />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center space-x-2"
                >
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-lg font-bold">Championship Match</span>
                </motion.div>
                <TeamInfo name={session.team2DisplayName} icon={session.team2Logo} score={session.team2Score} flipped />
            </motion.div>
        </div>
    );
}

function TeamInfo({ name, icon, score, flipped = false } : {
    name: string;
    icon: string | undefined | null;
    score: number;
    flipped?: boolean;
}) {
    return (
        <motion.div
            className={`flex items-center space-x-4 ${flipped ? "flex-row-reverse" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            {icon && <motion.img
                src={icon}
                alt={`${name} logo`}
                className="w-8 h-8 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            />}
            <span className="text-lg font-semibold">{name}</span>
            <motion.div
                className="bg-gray-700 px-3 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                <span className="text-2xl font-bold">{score}</span>
            </motion.div>
        </motion.div>
    );
}