import { cn, getGameLogoSrc } from "@/lib/utils";
import { NotFound } from "../NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion, useAnimate } from "framer-motion";

export function GenericMatchOverlay({ route }: { route: any }) {
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
        const [scope, animate] = useAnimate();
        useEffect(() => {
            animate(
                scope.current,
                { x: "0" },
                {
                    duration: 0.5,
                    delay: delay ?? 0,
                },
            );
        }, [scope]);
    return (
        <motion.div
            ref={scope}
            style={{
                backgroundColor: color,
            }}
            className={cn("flex items-center gap-4 w-1/2 justify-end pr-4", flipped && "flex-row-reverse justify-end pl-4 pr-0")}
            initial={{ x: !flipped ? "-100%" : "200%" }}
        >
            {icon && <img src={icon} alt={`${name} logo`} className="w-10 h-10" />}
            <span className="text-4xl font-semibold font-overwatchOblique">{name}</span>
            <span className="text-4xl font-overwatch">{score}</span>
        </motion.div>
    );
}