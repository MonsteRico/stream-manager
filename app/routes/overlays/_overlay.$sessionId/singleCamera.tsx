import { createFileRoute, redirect } from "@tanstack/react-router";

import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "@/components/NotFound";
import CasterInfoCard from "@/components/overlay/CasterInfoCard";
import BorderAnimation from "@/components/overlay/BorderAnimation";
import { z } from "zod";
import { zodSearchValidator, fallback } from "@tanstack/router-zod-adapter";
import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

const searchSchema = z.object({
    text: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/overlays/_overlay/$sessionId/singleCamera")({
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
    component: SingleCamOverlay,
    validateSearch: zodSearchValidator(searchSchema),
});

function SingleCamOverlay() {
    const { text } = Route.useSearch();
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
        <>
        <BorderAnimation clippath={`polygon(0% 0%, 0% 100%, 3% 100%, 3% 3%, 97% 3%, 97% 97%, 3% 97%, 3% 100%, 100% 100%, 100% 0%)`}>
            <div className="flex flex-col items-center justify-center my-auto w-full h-full">
                <div className="flex h-full w-full z-30 flex-col items-baseline relative overflow-hidden">
                    
                </div>
            </div>
        </BorderAnimation>
        <div className="flex flex-row inset-0 z-10 absolute h-full justify-between items-end">
                        {text.length > 0 && <CasterInfoCard name={text} showSocials={false} delay={session.animationDelay} />}
                    </div></>
    );
}
