"use client";

import type { NewSession, Session } from "@/db/schema";
import type { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
import { useCallback, useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Edit2, Link } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ChoosePresetTeams from "./ChoosePresetTeams";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UploadButton } from "@/lib/uploadthing";

function EditTeamsDash({
    session,
    mutateFn,
    mutateAsyncFn,
}: {
    session: Session;
    mutateFn: UseMutateFunction<unknown, unknown, NewSession, unknown>;
    mutateAsyncFn: UseMutateAsyncFunction<unknown, unknown, NewSession, unknown>;
}) {
    const [formState, setFormState] = useState<NewSession>(session);
    const [teamOrder, setTeamOrder] = useState([1, 2]);
    const [editingTeam, setEditingTeam] = useState<null | 1 | 2>(null);

    useEffect(() => {
        setFormState((prev) => ({ ...prev, ...session }));
    }, [session]);

    const flipSides = () => {
        setTeamOrder(teamOrder.reverse());
        setFormState((prev) => ({ ...prev, team1First: !prev.team1First }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleScoreChange = (team: 1 | 2, increment: boolean) => {
        const scoreKey = `team${team}Score` as "team1Score" | "team2Score";
        setFormState((prev) => ({
            ...prev,
            [scoreKey]: Math.max(0, prev[scoreKey]! + (increment ? 1 : -1)),
        }));
    };

    const handleTeamNameChange = (team: 1 | 2, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [`team${team}DisplayName`]: value,
        }));
    };

    const handleSave = () => {
        mutateFn(formState);
    };

    function resetLogos() {
        setFormState((prev) => ({
            ...prev,
            team1Logo: null,
            team2Logo: null,
        }));
    }

    return (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Edit Teams</CardTitle>
                <div className="flex flex-row gap-2">
                    <Button onClick={flipSides}>Flip Teams</Button>
                    <ChoosePresetTeams sessionId={session.id} mutateFunction={mutateAsyncFn} />
                    <Button onClick={resetLogos}>Reset Logos</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {teamOrder.map((team) => (
                        <div key={team} className="space-y-4">
                            <div className="flex items-center justify-between">
                                {editingTeam === team ? (
                                    <Input
                                        className="text-2xl font-bold bg-transparent border-b border-white flex-grow mr-4"
                                        value={formState[`team${team}DisplayName` as "team1DisplayName" | "team2DisplayName"]}
                                        onChange={(e) => handleTeamNameChange(team as 1 | 2, e.target.value)}
                                        onBlur={() => setEditingTeam(null)}
                                        autoFocus
                                    />
                                ) : (
                                    <h2
                                        className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors duration-200 flex-grow mr-4"
                                        onClick={() => setEditingTeam(team as 1 | 2)}
                                    >
                                        {formState[`team${team}DisplayName` as "team1DisplayName" | "team2DisplayName"]}{" "}
                                        <Edit2 className="inline-block w-4 h-4 ml-2" />
                                    </h2>
                                )}
                                <div className="flex items-center">
                                    <div className="flex flex-col mr-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleScoreChange(team as 1 | 2, true)}
                                            className="px-2 py-0 h-6"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleScoreChange(team as 1 | 2, false)}
                                            className="px-2 py-0 h-6 mt-1"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {formState[`team${team}Score` as "team1Score" | "team2Score"]}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <Label htmlFor={`team${team}Abbreviation`}>Abbreviation</Label>
                                    <Input
                                        id={`team${team}Abbreviation`}
                                        name={`team${team}Abbreviation`}
                                        type="text"
                                        value={formState[`team${team}Abbreviation` as "team1Abbreviation" | "team2Abbreviation"]}
                                        onChange={handleInputChange}
                                        className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor={`team${team}Record`}>Record</Label>
                                    <Input
                                        id={`team${team}Record`}
                                        name={`team${team}Record`}
                                        type="text"
                                        value={formState[`team${team}Record` as "team1Record" | "team2Record"]}
                                        onChange={handleInputChange}
                                        className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor={`team${team}Rank`}>Rank/Seed</Label>
                                    <Input
                                        id={`team${team}Rank`}
                                        name={`team${team}Rank`}
                                        type="text"
                                        value={formState[`team${team}Rank` as "team1Rank" | "team2Rank"]}
                                        onChange={handleInputChange}
                                        className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <Label htmlFor={`team${team}Color`}>Color</Label>
                                    <Input
                                        id={`team${team}Color`}
                                        name={`team${team}Color`}
                                        type="color"
                                        value={formState[`team${team}Color` as "team1Color" | "team2Color"]}
                                        onChange={handleInputChange}
                                        className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <LogoEdit team={team as 1 | 2} formState={formState} setFormState={setFormState} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button onClick={handleSave} className="mt-6 w-full">
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    );
}

function LogoEdit({
    team,
    formState,
    setFormState,
}: {
    team: 1 | 2;
    formState: NewSession;
    setFormState: React.Dispatch<React.SetStateAction<NewSession>>;
}) {
    const handleLogoChange = (team: 1 | 2, type: "url") => {
        if (type === "url") {
            const url = prompt("Enter logo URL:");
            if (url) {
                setFormState((prev) => ({
                    ...prev,
                    [`team${team}Logo`]: url,
                }));
            }
        }
    };

    return (
        <>
            <Label htmlFor={`team${team}Logo`}>Logo</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10">
                        {formState[`team${team}Logo` as "team1Logo" | "team2Logo"] ? (
                            <img
                                src={formState[`team${team}Logo` as "team1Logo" | "team2Logo"] ?? ""}
                                alt={`Team ${team} logo`}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            "Set Logo"
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                    <div className="grid gap-4">
                        <Button onClick={() => handleLogoChange(team as 1 | 2, "url")}>
                            <Link className="mr-2 h-4 w-4" /> URL
                        </Button>
                        <UploadButton
                            className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
                            endpoint="imageUploader"
                            onClientUploadComplete={([{ url }]) => {
                                setFormState((prev) => ({
                                    ...prev,
                                    [`team${team}Logo`]: url,
                                }));
                            }}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}

export default EditTeamsDash;
