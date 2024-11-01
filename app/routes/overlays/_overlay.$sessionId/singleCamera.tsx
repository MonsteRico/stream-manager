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
    const placeholderRef = useRef<HTMLDivElement>(null);
    const [clipPath, setClipPath] = useState("");

    // Function to calculate clip-path based on the placeholder's boundaries
    useEffect(() => {
        if (placeholderRef.current) {
            const { top, left, width, height } = placeholderRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Convert pixel values to percentages for clip-path
            const topPercent = (top / viewportHeight) * 100;
            const leftPercent = (left / viewportWidth) * 100;
            const bottomPercent = ((top + height) / viewportHeight) * 100;
            const rightPercent = ((left + width) / viewportWidth) * 100;

            // Define a polygon that cuts out the placeholder area
            const newClipPath = `polygon(0% 0%, 0% 100%, ${leftPercent}% 100%, ${leftPercent}% ${topPercent}%, ${rightPercent}% ${topPercent}%, ${rightPercent}% ${bottomPercent}%, ${leftPercent}% ${bottomPercent}%, ${leftPercent}% 100%, 100% 100%, 100% 0%)`;

            setClipPath(newClipPath);
        }
    }, []);

    return (
        <BorderAnimation clippath={`polygon(0% 0%, 0% 100%, 10% 100%, 10% 10%, 90% 10%, 90% 90%, 10% 90%, 10% 100%, 100% 100%, 100% 0%)`}>
            <div className="flex flex-col items-center justify-center my-auto w-full h-full">
                <div className="flex h-full w-full z-30 flex-col items-baseline relative overflow-hidden">
                    <div className="flex flex-row inset-0 absolute h-full justify-between items-end">
                        {text.length > 0 && <CasterInfoCard name={text} showSocials={false} delay={session.animationDelay} />}
                    </div>
                </div>
            </div>
        </BorderAnimation>
    );
}
