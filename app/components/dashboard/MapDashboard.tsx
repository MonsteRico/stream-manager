import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions, updateSession } from "@/lib/serverFunctions";
import { NotFound } from "../NotFound";
import type { MapInfo, NewSession } from "@/db/schema";

export default function MatchMapsDashboard({ sessionId, gameMaps }: { sessionId: string; gameMaps: MapInfo[] }) {
    const sessionQuery = useSuspenseQuery({
        ...sessionQueryOptions(sessionId),
    });

    if (!sessionQuery.data) {
        return <NotFound>Session not found</NotFound>;
    }

    const session = sessionQuery.data;

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationKey: ["updateSession"],
        mutationFn: async ({
            name,
            team1DisplayName,
            game,
            mapInfo,
            team2DisplayName,
            team1Color,
            team2Color,
            team1Logo,
            team2Logo,
            team1Score,
            team2Score,
        }: NewSession) => {
            console.log(mapInfo);
            await updateSession({
                id: sessionId,
                name,
                team1DisplayName,
                team2DisplayName,
                team1Color,
                team2Color,
                team1Logo,
                team2Logo,
                team1Score,
                team2Score,
                game,
                mapInfo,
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["session"],
            });
        },
    });

    const [maps, setMaps] = useState<MapInfo[]>(session.mapInfo as MapInfo[]);

    const addMap = () => {
        const newMap: MapInfo = {
            id: Date.now(),
            name: "",
            winner: null,
            image: "",
            mode: null,
        };
        setMaps([...maps, newMap]);
        mutate({
            mapInfo: [...maps, newMap],
        });
    };

    const removeMap = (id: number) => {
        const newMaps = maps.filter((map) => map.id !== id);
        setMaps(newMaps);
        mutate({
            mapInfo: newMaps,
        });
    };

    const updateMap = (id: number, field: keyof MapInfo, value: string) => {
        const gameMap = gameMaps.find((map) => map.name === value);
        let newMaps = maps.map((map) =>
            map.id === id ? { ...map, [field]: value, mode: gameMap?.mode ?? map.mode, image: gameMap?.image ?? map.image } : map,
        );
        setMaps(newMaps);
        mutate({
            mapInfo: newMaps,
        });
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Match Maps Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="mapCount">Number of Maps: {maps.length}</Label>
                            <Button type="button" onClick={addMap} className="bg-green-600 hover:bg-green-700">
                                Add Map
                            </Button>
                        </div>
                        {maps.map((map, index) => (
                            <div key={map.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Map {index + 1}</h3>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeMap(map.id)}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`map-${map.id}`}>Map Name</Label>
                                        <Select
                                            value={map.name}
                                            onValueChange={(value) => {
                                                updateMap(map.id, "name", value);
                                            }}
                                        >
                                            <SelectTrigger id={`map-${map.id}`} className="bg-gray-600 border-gray-500">
                                                <SelectValue placeholder="Select a map" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gameMaps.map((option) => (
                                                    <SelectItem key={option.id} value={option.name}>
                                                        {option.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`winner-${map.id}`}>Winner</Label>
                                        <Select
                                            value={map.winner || ""}
                                            onValueChange={(value) => updateMap(map.id, "winner", value as "team1" | "team2")}
                                        >
                                            <SelectTrigger id={`winner-${map.id}`} className="bg-gray-600 border-gray-500">
                                                <SelectValue placeholder="Select winner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="team1">{session.team1DisplayName}</SelectItem>
                                                <SelectItem value="team2">{session.team2DisplayName}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
