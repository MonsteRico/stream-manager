import { createFileRoute, redirect } from "@tanstack/react-router";

import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "@/components/NotFound";
import { useSuspenseQuery } from "@tanstack/react-query";
import CasterInfoCard from "@/components/CasterInfoCard";
import type { CasterInfo } from "@/db/schema";
import BorderAnimation from "@/components/BorderAnimation";
import MovingDots from "@/components/MovingDots";
import { z } from "zod";
import { zodSearchValidator, fallback } from "@tanstack/router-zod-adapter";
import { useEffect, useRef, useState } from "react";

const searchSchema = z.object({
  text: fallback(z.string(), "").default(""),
})

export const Route = createFileRoute("/overlays/$sessionId/singleCamera")({
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
        <BorderAnimation clippath={clipPath}>
            <div className="flex flex-col items-center justify-center my-auto w-full h-full">
                <div className="flex h-full w-full z-30 flex-col items-baseline relative overflow-hidden">
                    <div className="w-[90%] h-[90%] rounded-lg bg-secondary" ref={placeholderRef}>
                        {/* Placeholder for camera feed */}
                        <div className="w-full h-full flex items-center justify-center text-secondary-foreground">Camera Feed</div>
                    </div>
                    <div className="flex flex-row inset-0 absolute h-full justify-between items-end">
                        {text.length > 0 && <CasterInfoCard name={text} showSocials={false} />}
                    </div>
                </div>
            </div>
        </BorderAnimation>
    );
}
