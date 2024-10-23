import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { MapInfo } from "@/db/schema";
import { NotFound } from "@/components/NotFound";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

const placeholderImage = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

export const Route = createFileRoute("/overlays/$sessionId/maps")({
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
    component: MapOverlay,
});

export default function MapOverlay() {
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

    const maps = session.mapInfo as MapInfo[];

    const [visibleMaps, setVisibleMaps] = useState<MapInfo[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (visibleMaps.length < maps.length) {
                setVisibleMaps((prev) => [...prev, maps[prev.length]]);
            } else {
                clearInterval(timer);
            }
        }, ); // Adjust timing as needed

        return () => clearInterval(timer);
    }, [maps, visibleMaps]);

    return (
        <div className="w-full bg-gray-900 p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {maps.map((map, index) => (
                    <motion.div
                        key={map.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={index < visibleMaps.length ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="relative aspect-video bg-gray-800 rounded-md overflow-hidden"
                    >
                        <img
                            src={map.name && map.image ? map.image : placeholderImage}
                            alt={map.name || "TBD"}
                            style={{ objectFit: "cover" }}
                        />
                        {map.winner && (
                            <div
                                style={{
                                    backgroundColor: map.winner === "team1" ? session.team1Color : session.team2Color,
                                }}
                                className={`absolute inset-0 bg-opacity-70 flex items-center justify-center`}
                            >
                                <img
                                    src={(map.winner == "team1" ? session.team1Logo : session.team2Logo) ?? ""}
                                    alt={`${map.winner == "team1" ? session.team1DisplayName : session.team2DisplayName} logo`}
                                    width={80}
                                    height={80}
                                />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-white">
                            <h3 className="text-lg font-bold">{map.name || "TBD"}</h3>
                            {map.mode && <p className="text-sm">{map.mode}</p>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
