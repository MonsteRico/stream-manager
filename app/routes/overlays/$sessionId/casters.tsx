import { createFileRoute, redirect } from "@tanstack/react-router";

import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "@/components/NotFound";
import { useSuspenseQuery } from "@tanstack/react-query";
import CasterInfoCard from "@/components/CasterInfoCard";
import type { CasterInfo } from "@/db/schema";
import MovingDots from "@/components/MovingDots";
import BorderAnimation from "@/components/BorderAnimation";

export const Route = createFileRoute("/overlays/$sessionId/casters")({
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
    component: CastersOverlay,
});

const CasterCard = (props: CasterInfo) => (
    <div className="flex flex-col items-center">
        <div className="w-[33dvw] h-[70dvh] bg-secondary mb-2 rounded-lg overflow-hidden">
            {/* Placeholder for camera feed */}
            <div className="w-full h-full flex items-center justify-center text-secondary-foreground">Camera Feed</div>
        </div>
        <CasterInfoCard {...props} />
    </div>
);

function CastersOverlay() {
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
    const casters = session.casters as CasterInfo[];

    return (
        <BorderAnimation>
            <div className="flex flex-col items-center justify-center my-auto">
                <div className="flex h-full w-full z-30 flex-row items-baseline gap-8">
                    {casters.map((caster: CasterInfo, index) => (
                        <CasterCard key={index} {...caster} />
                    ))}
                </div>
                <MovingDots
                    backgroundColor="#d1d3d4"
                    startX={614}
                    startY={520}
                    endX={1225}
                    endY={240}
                    numDots={3}
                    repeatDelay={1.5}
                    staggerDelay={0.2}
                />
            </div>
        </BorderAnimation>
    );
}
