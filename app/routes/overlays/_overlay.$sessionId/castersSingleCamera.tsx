import { createFileRoute, redirect } from "@tanstack/react-router";

import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "@/components/NotFound";
import { useSuspenseQuery } from "@tanstack/react-query";
import CasterInfoCard from "@/components/overlay/CasterInfoCard";
import type { CasterInfo } from "@/db/schema";
import BorderAnimation from "@/components/overlay/BorderAnimation";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/overlays/_overlay/$sessionId/castersSingleCamera")({
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
    component: SingleCamCastersOverlay,
});

function SingleCamCastersOverlay() {
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
        <BorderAnimation clippath={`polygon(0% 0%, 0% 100%, 10% 100%, 10% 10%, 90% 10%, 90% 90%, 10% 90%, 10% 100%, 100% 100%, 100% 0%)`}>
            <div className="flex flex-col items-center justify-center my-auto w-full h-full">
                <div className="flex h-full w-full z-30 flex-col items-center my-auto relative overflow-hidden">
                    <div className="flex flex-row inset-0 absolute h-full justify-between items-end">
                        {casters.map((caster: CasterInfo, index) => (
                            <CasterInfoCard key={index} {...caster} showSocials={false} delay={0} />
                        ))}
                    </div>
                </div>
            </div>
        </BorderAnimation>
    );
}
