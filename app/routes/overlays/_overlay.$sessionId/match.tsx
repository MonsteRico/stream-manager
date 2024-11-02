import { NotFound } from "@/components/NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn, getGameLogoSrc } from "@/lib/utils";

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
            return <OverwatchMatchOverlay />;
        case "Splatoon":
            return <SplatoonMatchOverlay />;
        case "Rocket League":
            return <RocketLeagueMatchOverlay />;
        case "Smash":
            return <SmashMatchOverlay />;
        case "Valorant":
            return <ValorantMatchOverlay />;
        case "CS":
            return <CSMatchOverlay />;
        case "League of Legends":
            return <LeagueOfLegendsMatchOverlay />;
        default:
            return <GenericMatchOverlay />;
    }
}

function GenericMatchOverlay() {
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

    return (
        <div className="relative w-full h-12 flex flex-row">
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

function SplatoonMatchOverlay() {
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
        return (
            <motion.div
                style={{
                    backgroundColor: color,
                }}
                className={cn("flex items-center gap-4 justify-between pr-2", flipped && "flex-row-reverse justify-end pl-4 pr-0")}
                initial={{ x: "-200%" }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="gap-2 flex flex-row items-center">
                    {icon && <img src={icon} alt={`${name} logo`} className="w-10 h-10" />}
                    <span className="text-2xl">{name}</span>
                </div>
                <span className="text-3xl bg-white text-black px-2 py-1 font-bold">{score}</span>
            </motion.div>
        );
    }

    return (
        <div className="absolute top-12 left-4 w-[15%] h-12 flex flex-col">
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
            />
        </div>
    );
}

function OverwatchMatchOverlay() {
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
        return (
            <motion.div
                style={{
                    backgroundColor: color,
                }}
                className={cn(
                    "flex items-center gap-4 mt-4 w-[29.5%] h-12 justify-end pr-4",
                    flipped && "flex-row-reverse justify-end pl-4 pr-0",
                )}
                initial={{ x: !flipped ? "-100%" : "200%" }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                <span className="text-5xl font-overwatchOblique">{name}</span>
                <span className="text-5xl font-bold font-overwatch">{score}</span>
            </motion.div>
        );
    }

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
                    />
                    {session.matchName != "" && (
                        <div className="bg-gray-800 w-[13.6%] h-6 absolute left-[43.2%] top-1 flex items-center justify-center">
                            <p className="text-sm font-bold px-2">{session.matchName}</p>
                        </div>
                    )}
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

function LeagueOfLegendsMatchOverlay() {
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
        return (
            <motion.div
                style={{
                    backgroundColor: color,
                }}
                className={cn("flex items-center gap-4 w-[34%] h-12 justify-end pr-4", flipped && "flex-row-reverse justify-end pl-4 pr-0")}
                initial={{ x: !flipped ? "-100%" : "200%" }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                <span className="text-5xl font-overwatchOblique">{name}</span>
                <span className="text-5xl font-bold font-overwatch">{score}</span>
            </motion.div>
        );
    }

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

function SmashMatchOverlay() {
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
        return (
            <motion.div
                style={{
                    backgroundColor: color,
                }}
                className={cn(
                    "flex items-center gap-4 mt-4 w-[29.5%] h-12 justify-end pr-4",
                    flipped && "flex-row-reverse justify-end pl-4 pr-0",
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                <span className="text-4xl">{name}</span>
                <span className="text-4xl font-bold">{score}</span>
            </motion.div>
        );
    }

    return (
        <div className="relative w-full flex flex-row justify-center !overflow-hidden">
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

function RocketLeagueMatchOverlay() {
    return null;
}

function CSMatchOverlay() {
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
        return (
            <motion.div
                style={{
                    backgroundColor: color,
                }}
                className={cn(
                    "flex items-center gap-4 mt-4 w-[19.5%] h-12 justify-between pr-4 pl-2",
                    flipped && "flex-row-reverse pl-4 pr-2",
                )}
                initial={{ x: !flipped ? "-100%" : "200%" }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className={cn("flex flex-row items-center gap-4", flipped && "flex-row-reverse")}>
                    {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                    <span className="text-3xl">{name}</span>
                </div>
                <span className="text-4xl">{score}</span>
            </motion.div>
        );
    }

    return (
        <div className="relative w-full flex flex-row justify-evenly !overflow-hidden">
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

function ValorantMatchOverlay() {
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
        const [scope2, animate2] = useAnimate();
        useEffect(() => {
            animate(
                scope.current,
                { x: [!flipped ? "-300%" : "500%", 0] },
                {
                    duration: 0.5,
                    delay,
                },
            );
        }, [scope, animate, flipped, delay]);

        return (
            <div className={cn("flex flex-row-reverse w-1/2", flipped && "flex-row")}>
                <motion.div
                    style={{
                        backgroundColor: color,
                    }}
                    className={cn("flex items-center gap-4 w-full h-6")}
                    ref={scope}
                ></motion.div>
                <motion.div
                    style={{
                        backgroundColor: color,
                    }}
                    className={cn(
                        "flex items-center gap-4 w-[60%] h-16 justify-between pr-4 pl-2",
                        flipped && "flex-row-reverse pl-4 pr-2",
                    )}
                    ref={scope2}
                >
                    <div className={cn("flex flex-row items-center gap-4", flipped && "flex-row-reverse")}>
                        {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                        <span className="text-3xl">{name}</span>
                    </div>
                    <span className="text-4xl">{score}</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-full flex flex-row !overflow-hidden">
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
