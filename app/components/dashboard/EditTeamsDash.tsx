import type { NewSession, Session } from "@/db/schema";
import type { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useCallback, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { ChevronDown, ChevronUp, Edit2, Link } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import ChoosePresetTeams from "./ChoosePresetTeams";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
    const [teamOrder, setTeamOrder] = useState([1, 2]);

    const flipSides = () => {
        setTeamOrder(teamOrder.reverse());
        mutateFn({
            team1First: !session.team1First,
        });
    };

    const [editingTeam, setEditingTeam] = useState<null | 1 | 2>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedInputChange(e.target.name, e.target.value);
    };

    const handleScoreChange = (team: 1 | 2, increment: boolean) => {
        mutateFn({
            [`team${team}Score`]: Math.max(0, session[`team${team}Score` as "team1Score" | "team2Score"] + (increment ? 1 : -1)),
        });
    };

    const debouncedTeamNameChange = useCallback(
        debounce((team: 1 | 2, value: string) => {
            mutateFn({
                [`team${team}DisplayName`]: value,
            });
        }, 300),
        [],
    );

    const debouncedInputChange = useCallback(
        debounce((name: string, value: string) => {
            mutateFn({
                [name]: value,
            });
        }, 300),
        [],
    );

    const handleTeamNameChange = (team: 1 | 2, value: string) => {
        debouncedTeamNameChange(team, value);
    };

    return (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Edit Teams</CardTitle>
                <div className="flex flex-row gap-2">
                    <Button onClick={flipSides}>Flip Teams</Button>
                    <ChoosePresetTeams sessionId={session.id} mutateFunction={mutateAsyncFn} />
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
                                        defaultValue={session[`team${team}DisplayName`]}
                                        onChange={(e) => handleTeamNameChange(team as 1 | 2, e.target.value)}
                                        onBlur={() => setEditingTeam(null)}
                                        autoFocus
                                    />
                                ) : (
                                    <h2
                                        className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors duration-200 flex-grow mr-4"
                                        onClick={() => setEditingTeam(team as 1 | 2)}
                                    >
                                        {session[`team${team}DisplayName` as "team1DisplayName" | "team2DisplayName"]}{" "}
                                        <Edit2 className="inline-block w-4 h-4 ml-2" />
                                    </h2>
                                )}
                                <div className="flex items-center">
                                    <div className="flex flex-col mr-2">
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => handleScoreChange(team as 1 | 2, true)}
                                            className="px-2 py-0 h-6"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleScoreChange(team as 1 | 2, false)}
                                            className="px-2 py-0 h-6 mt-1"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-3xl font-bold">{session[`team${team}Score` as "team1Score" | "team2Score"]}</span>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <Label htmlFor={`team${team}Abbreviation`}>Abbreviation</Label>
                                    <Input
                                        id={`team${team}Abbreviation`}
                                        name={`team${team}Abbreviation`}
                                        type="text"
                                        value={session[`team${team}Abbreviation` as "team1Abbreviation" | "team2Abbreviation"]}
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
                                        value={session[`team${team}Record` as "team1Record" | "team2Record"]}
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
                                        value={session[`team${team}Rank` as "team1Rank" | "team2Rank"]}
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
                                        value={session[`team${team}Color` as "team1Color" | "team2Color"]}
                                        onChange={handleInputChange}
                                        className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <LogoEdit team={team as 1 | 2} session={session} mutateFn={mutateFn} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default EditTeamsDash;

function LogoEdit({
    team,
    session,
    mutateFn,
}: {
    team: 1 | 2;
    session: Session;
    mutateFn: UseMutateFunction<unknown, unknown, NewSession, unknown>;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (team: 1 | 2, type: "url") => {
        if (type === "url") {
            const url = prompt("Enter logo URL:");
            if (url) {
                mutateFn({
                    [`team${team}Logo`]: url,
                });
            }
        }
    };

    return (
        <>
            <Label htmlFor={`team${team}Logo`}>Logo</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-10">
                        {session[`team${team}Logo` as "team1Logo" | "team2Logo"] ? (
                            <img
                                src={session[`team${team}Logo` as "team1Logo" | "team2Logo"] ?? ""}
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
                                mutateFn({
                                    [`team${team}Logo`]: url,
                                });
                            }}
                        />
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" />
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
