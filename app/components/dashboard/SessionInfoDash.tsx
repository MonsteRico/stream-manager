import type { NewSession, Session } from "@/db/schema";
import type { UseMutateFunction } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Edit2 } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { endSession } from "@/lib/serverFunctions";
import { useRouter } from "@tanstack/react-router";

function SessionInfoDash({ session, mutateFn }: { session: Session; mutateFn: UseMutateFunction<unknown, unknown, NewSession, unknown> }) {
    const [editingSession, setEditingSession] = useState(false);

    const handleSelectChange = (name: string, value: string) => {
        mutateFn({
            [name]: value,
        });
    };

    const debouncedSessionNameChange = useCallback(
        debounce((value: string) => {
            mutateFn({
                name: value,
            });
        }, 300),
        [],
    );

    const handleSessionNameChange = (value: string) => {
        debouncedSessionNameChange(value);
    };

    const debouncedAnimationDelayChange = useCallback(
        debounce((value: string) => {
            mutateFn({
                animationDelay: parseInt(value),
            });
        }, 300),
        [],
    );

    const handleAnimationDelayChange = (value: string) => {
        debouncedAnimationDelayChange(value);
    };

    const router = useRouter();

    return (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader>
                {editingSession ? (
                    <Input
                        className="text-3xl font-bold bg-transparent border-b border-white w-full"
                        defaultValue={session.name}
                        onChange={(e) => handleSessionNameChange(e.target.value)}
                        onBlur={() => setEditingSession(false)}
                        autoFocus
                    />
                ) : (
                    <h1
                        className="text-3xl font-bold text-center cursor-pointer hover:text-gray-300 transition-colors duration-200"
                        onClick={() => setEditingSession(true)}
                    >
                        {session.name} <Edit2 className="inline-block w-6 h-6 ml-2" />
                    </h1>
                )}
            </CardHeader>
            <CardContent className="flex flex-row justify-between gap-2">
                <div className="flex flex-row  items-center gap-2">
                    <Label htmlFor="game">Game</Label>
                    <Select name="game" value={session.game as string} onValueChange={(value) => handleSelectChange("game", value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 min-w-32">
                            <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Overwatch">Overwatch</SelectItem>
                            <SelectItem value="Rocket League">Rocket League</SelectItem>
                            <SelectItem value="Smash">Smash</SelectItem>
                            <SelectItem value="Valorant">Valorant</SelectItem>
                            <SelectItem value="CS">CS</SelectItem>
                            <SelectItem value="League of Legends">League of Legends</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Label htmlFor="team1DisplayName">Animation Delay (in seconds)</Label>
                    <Input
                        className="text-xl font-bold bg-transparent border-b border-white w-full"
                        defaultValue={session.animationDelay}
                        onChange={(e) => handleAnimationDelayChange(e.target.value)}
                    />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            await endSession(session.id);
                            localStorage.removeItem("sessionId");
                            router.navigate({
                                to: "/",
                            });
                        }}
                    >
                        End Session
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default SessionInfoDash;
