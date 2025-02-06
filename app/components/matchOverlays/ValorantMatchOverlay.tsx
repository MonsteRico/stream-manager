import { cn, getGameLogoSrc } from "@/lib/utils";
import { NotFound } from "../NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion, useAnimate } from "framer-motion";

export function ValorantMatchOverlay({ route }: { route: any }) {
    const router = useRouter();
    const { sessionId } = route.useParams();
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
        <div className="relative w-full flex flex-row !overflow-hidden">
            {session.team1First && (
                <>
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo ?? getGameLogoSrc(session.game)}
                        score={session.team1Score}
                        bestOf={session.bestOf}
                        color={session.team1Color}
                        delay={session.animationDelay}
                        numMaps={session.mapInfo.length}
                    />
                    <TeamInfo
                        name={session.team2DisplayName}
                        icon={session.team2Logo ?? getGameLogoSrc(session.game)}
                        score={session.team2Score}
                        bestOf={session.bestOf}
                        color={session.team2Color}
                        flipped
                        numMaps={session.mapInfo.length}
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
                        bestOf={session.bestOf}
                        numMaps={session.mapInfo.length}
                        delay={session.animationDelay}
                    />
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo ?? getGameLogoSrc(session.game)}
                        score={session.team1Score}
                        color={session.team1Color}
                        numMaps={session.mapInfo.length}
                        bestOf={session.bestOf}
                        flipped
                        delay={session.animationDelay}
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
    bestOf,
    flipped = false,
    numMaps
}: {
    name: string;
    icon: string;
    score: number;
    color: string;
    flipped?: boolean;
    bestOf: boolean;
    numMaps: number;
    delay: number;
}) {
    const [scope1, animate1] = useAnimate();
    const [scope2, animate2] = useAnimate();
    useEffect(() => {
        animate1(
            scope1.current,
            { x: "0" },
            {
                duration: 0.5,
                delay: delay ?? 0,
            },
        );
        animate2(
            scope2.current,
            { x: "0" },
            {
                duration: 0.5,
                delay: delay ?? 0,
            },
        );
    }, [scope1, scope2]);

    return (
        <div className={cn("flex flex-row-reverse w-1/2", flipped && "flex-row")}>
            <motion.div
                initial={{
                    x: !flipped ? "-300%" : "500%",
                }}
                style={{
                    backgroundColor: color,
                }}
                className={cn("flex items-center gap-4 w-full h-6")}
                ref={scope1}
            ></motion.div>
            <motion.div
                initial={{
                    x: !flipped ? "-300%" : "500%",
                }}
                ref={scope2}
                style={{
                    backgroundColor: color,
                }}
                className={cn("flex items-center gap-4 w-[60%] h-16 justify-between pr-4 pl-2", flipped && "flex-row-reverse pl-4 pr-2")}
            >
                <div className={cn("flex flex-row items-center gap-4", flipped && "flex-row-reverse")}>
                    {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                    <span className="text-3xl">{name}</span>
                </div>
                        {Array.from({ length: score }).map((_, index) => (
                            <div key={index} className="bg-white h-4 w-4 rounded-full"></div>
                        ))}
                        {Array.from({ length: (bestOf ? Math.round(numMaps / 2)  : numMaps) - score }).map((_, index) => (
                            <div key={index} className="border-2 border-white h-4 w-4 rounded-full"></div>
                        ))}            </motion.div>
        </div>
    );
}
