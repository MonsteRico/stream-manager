"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { CasterInfo, NewSession } from "@/db/schema";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions, updateSession } from "@/lib/serverFunctions";
import { NotFound } from "./NotFound";
import debounce from "lodash.debounce";

export default function CasterDashboard({ sessionId }: { sessionId: string }) {
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
            casters,
        }: NewSession) => {
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
                casters,
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["session"],
            });
        },
    });

    const [casters, setCasters] = useState<CasterInfo[]>(session.casters as CasterInfo[] || []);

    const addCaster = () => {
        const newCaster: CasterInfo = {
            id: Date.now(),
            name: "",
            pronouns: "",
            twitter: "",
            twitch: "",
            youtube: "",
            instagram: "",
        };
        setCasters([...casters, newCaster]);
    };

    const removeCaster = (id: number) => {
        const newCasters = casters.filter((caster) => caster.id !== id);
        setCasters(newCasters);
        debouncedUpdate(newCasters);
    };

    const debouncedUpdate = useCallback(
        debounce((newCasters: CasterInfo[]) => {
            mutate({
                ...session,
                casters: newCasters,
            });
        }, 1000),
        [mutate, session],
    );

    const updateCaster = (id: number, field: keyof CasterInfo, value: string) => {
        const newCasters = casters.map((caster) => (caster.id === id ? { ...caster, [field]: value } : caster));
        setCasters(newCasters);
        debouncedUpdate(newCasters);
    };

    useEffect(() => {
        return () => {
            debouncedUpdate.cancel();
        };
    }, [debouncedUpdate]);

    return (
        <div className="container mx-auto p-4">
            <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Casters Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Label>Number of Casters: {casters.length}</Label>
                            <Button type="button" onClick={addCaster} className="bg-green-600 hover:bg-green-700">
                                Add Caster
                            </Button>
                        </div>
                        {casters.map((caster, index) => (
                            <div key={caster.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Caster {index + 1}</h3>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeCaster(caster.id)}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`name-${caster.id}`}>Name</Label>
                                        <Input
                                            id={`name-${caster.id}`}
                                            value={caster.name}
                                            onChange={(e) => updateCaster(caster.id, "name", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`pronouns-${caster.id}`}>Pronouns</Label>
                                        <Input
                                            id={`pronouns-${caster.id}`}
                                            value={caster.pronouns}
                                            onChange={(e) => updateCaster(caster.id, "pronouns", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`twitter-${caster.id}`}>Twitter</Label>
                                        <Input
                                            id={`twitter-${caster.id}`}
                                            value={caster.twitter}
                                            onChange={(e) => updateCaster(caster.id, "twitter", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`twitch-${caster.id}`}>Twitch</Label>
                                        <Input
                                            id={`twitch-${caster.id}`}
                                            value={caster.twitch}
                                            onChange={(e) => updateCaster(caster.id, "twitch", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`youtube-${caster.id}`}>YouTube</Label>
                                        <Input
                                            id={`youtube-${caster.id}`}
                                            value={caster.youtube}
                                            onChange={(e) => updateCaster(caster.id, "youtube", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`instagram-${caster.id}`}>Instagram</Label>
                                        <Input
                                            id={`instagram-${caster.id}`}
                                            value={caster.instagram}
                                            onChange={(e) => updateCaster(caster.id, "instagram", e.target.value)}
                                            className="bg-gray-600 border-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
