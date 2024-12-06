import { cn, getGameLogoSrc } from "@/lib/utils";
import { NotFound } from "../NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion, useAnimate } from "framer-motion";

export function DeadlockMatchOverlay({ route }: { route: any }) {
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
        <div className="relative w-full flex flex-row !overflow-hidden justify-end">
            {session.team1First && (
                <>
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo ?? getGameLogoSrc(session.game)}
                        score={session.team1Score}
                        color={session.team1Color}
                        delay={session.animationDelay}
                        numMaps={session.mapInfo.length}
                    />
                    <TeamInfo
                        name={session.team2DisplayName}
                        icon={session.team2Logo ?? getGameLogoSrc(session.game)}
                        score={session.team2Score}
                        color={session.team2Color}
                        numMaps={session.mapInfo.length}
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
                        numMaps={session.mapInfo.length}
                        color={session.team2Color}
                        delay={session.animationDelay}
                    />
                    <TeamInfo
                        name={session.team1DisplayName}
                        icon={session.team1Logo ?? getGameLogoSrc(session.game)}
                        score={session.team1Score}
                        numMaps={session.mapInfo.length}
                        color={session.team1Color}
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
    numMaps,
    color,
    delay,
    flipped = false,
}: {
    name: string;
    icon: string;
    score: number;
    numMaps: number;
    color: string;
    flipped?: boolean;
    delay: number;
}) {
    const [scope2, animate2] = useAnimate();
    useEffect(() => {
        animate2(
            scope2.current,
            { x: "0" },
            {
                duration: 0.5,
                delay: delay ?? 0,
            },
        );
    }, [scope2]);

    return (
        <div className={cn("flex flex-row-reverse w-full", flipped && "flex-row")}>
            <div className="w-[70%]"></div>
            <motion.div
                initial={{
                    x: !flipped ? "-300%" : "500%",
                }}
                ref={scope2}
                style={{
                    backgroundColor: color,
                }}
                className={cn("flex items-center gap-4 w-[30%] h-32 justify-between pr-4 pl-2", flipped && "flex-row-reverse pl-4 pr-2")}
            >
                <div className="flex flex-col items-center w-full justify-center gap-2">
                    <div className={cn("flex flex-row items-center gap-4 w-full justify-between", flipped && "flex-row-reverse")}>
                        {icon && <img src={icon} alt={`${name} logo`} className="h-12 w-auto py-1" />}
                        <span className={cn("text-3xl w-full float-right text-end", flipped && "text-start")}>{name}</span>
                    </div>
                    <div className="w-full flex flex-row gap-2 justify-evenly">
                        {Array.from({ length: score }).map((_, index) => (
                            <div key={index} className="bg-white h-4 w-4 rounded-full"></div>
                        ))}
                        {Array.from({ length: numMaps - score }).map((_, index) => (
                            <div key={index} className="border-2 border-white h-4 w-4 rounded-full"></div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
