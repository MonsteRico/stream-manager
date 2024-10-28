import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-label";
import SearchableDropdown from "./SearchableDropdown";
import type { NewSession, Team } from "@/db/schema";
import { updateSession } from "@/lib/serverFunctions";
import { useUpdateSessionMutation } from "@/lib/utils";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { LoaderPinwheel } from "lucide-react";

function ChoosePresetTeams({ sessionId, mutateFunction }: { sessionId: string; mutateFunction: UseMutateAsyncFunction<unknown, unknown, NewSession, unknown> }) {
    const localStorageTeams = localStorage.getItem("myLocalTeams");
    const teams = localStorageTeams ? (JSON.parse(localStorageTeams) as Team[]) : ([] as Team[]);

    const [presetTeam1, setPresetTeam1] = React.useState<Team | null>(null);
    const [presetTeam2, setPresetTeam2] = React.useState<Team | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    async function setPresetTeams() {
        if (!presetTeam1 || !presetTeam2) {
            return;
        }
        setIsLoading(true);
        if (presetTeam1) {
            await mutateFunction({
                id: sessionId,
                team1DisplayName: presetTeam1.name,
                team1Color: presetTeam1.color,
                team1Logo: presetTeam1.logo,
                team1Abbreviation: presetTeam1.abbreviation,
                team1Rank: presetTeam1.rank,
            });
        }
        if (presetTeam2) {
            await mutateFunction({
                id: sessionId,
                team2DisplayName: presetTeam2.name,
                team2Color: presetTeam2.color,
                team2Logo: presetTeam2.logo,
                team2Abbreviation: presetTeam2.abbreviation,
                team2Rank: presetTeam2.rank,
            });
        }
        setIsLoading(false);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Choose Preset Teams</Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-4">
                    <Label htmlFor="team1">Team 1</Label>
                    <SearchableDropdown
                        items={teams.map((team) => {
                            return {
                                label: team.name,
                                value: team,
                            };
                        })}
                        onSelect={({ value }) => setPresetTeam1(value as Team)}
                    />
                </div>
                <div className="flex flex-row items-center gap-4">
                    <Label htmlFor="team2">Team 2</Label>
                    <SearchableDropdown
                        items={teams.map((team) => {
                            return {
                                label: team.name,
                                value: team,
                            };
                        })}
                        onSelect={({ value }) => setPresetTeam2(value as Team)}
                    />
                </div>
                <Button onClick={setPresetTeams}>{!isLoading ? "Save" : <LoaderPinwheel className="animate-spin" />}</Button>
            </DialogContent>
        </Dialog>
    );
}

export default ChoosePresetTeams;
