"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "../NotFound";
import type { NewSession, Session } from "@/db/schema";
import type { UseMutateFunction } from "@tanstack/react-query";
import { useKey } from "@/lib/useKey";
import { OverwatchCharacters } from "@/lib/characters";

interface BansDashboardProps {
    sessionId: string;
    mutateFn: UseMutateFunction<unknown, unknown, NewSession, unknown>;
}

export default function BansDashboard({ sessionId, mutateFn }: BansDashboardProps) {
    const sessionQuery = useSuspenseQuery({
        ...sessionQueryOptions(sessionId),
    });

    if (!sessionQuery.data) {
        return <NotFound>Session not found</NotFound>;
    }

    const session = sessionQuery.data;

    const [team1Ban, setTeam1Ban] = useState<string | null>(session.team1Ban || null);
    const [team2Ban, setTeam2Ban] = useState<string | null>(session.team2Ban || null);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync ban state with query data when it changes (e.g., from API calls)
    useEffect(() => {
        if (sessionQuery.data) {
            setTeam1Ban(sessionQuery.data.team1Ban || null);
            setTeam2Ban(sessionQuery.data.team2Ban || null);
        }
    }, [sessionQuery.data]);

    const handleSave = () => {
        mutateFn({
            team1Ban: team1Ban || null,
            team2Ban: team2Ban || null,
        });
        setHasChanges(false);
    };

    useKey("ctrls", handleSave);

    return (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Hero Bans</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="team1-ban">{session.team1DisplayName} Ban</Label>
                            <Select
                                value={team1Ban || ""}
                                onValueChange={(value) => {
                                    const newValue = value === "clear" ? null : value;
                                    setTeam1Ban(newValue);
                                    setHasChanges(true);
                                }}
                            >
                                <SelectTrigger id="team1-ban" className="bg-gray-600 border-gray-500">
                                    <SelectValue placeholder="Select a hero to ban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clear">No ban</SelectItem>
                                    {OverwatchCharacters.map((character) => (
                                        <SelectItem key={character.id} value={character.name}>
                                            {character.name} ({character.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team2-ban">{session.team2DisplayName} Ban</Label>
                            <Select
                                value={team2Ban || ""}
                                onValueChange={(value) => {
                                    const newValue = value === "clear" ? null : value;
                                    setTeam2Ban(newValue);
                                    setHasChanges(true);
                                }}
                            >
                                <SelectTrigger id="team2-ban" className="bg-gray-600 border-gray-500">
                                    <SelectValue placeholder="Select a hero to ban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clear">No ban</SelectItem>
                                    {OverwatchCharacters.map((character) => (
                                        <SelectItem key={character.id} value={character.name}>
                                            {character.name} ({character.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="button" onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!hasChanges}>
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

