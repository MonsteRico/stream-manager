import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import type { Team, Session } from "@stream-manager/shared";
import { LoaderPinwheel } from "lucide-react";

interface ChoosePresetTeamsProps {
  sessionId: string;
  mutateFunction: (data: Partial<Session>) => Promise<unknown>;
}

function ChoosePresetTeams({
  mutateFunction,
}: ChoosePresetTeamsProps) {
  const localStorageTeams = localStorage.getItem("myLocalTeams");
  const teams = localStorageTeams
    ? (JSON.parse(localStorageTeams) as Team[])
    : ([] as Team[]);

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
        team1DisplayName: presetTeam1.name,
        team1Color: presetTeam1.color,
        team1Logo: presetTeam1.logo,
        team1Abbreviation: presetTeam1.abbreviation,
        team1Rank: presetTeam1.rank,
      });
    }
    if (presetTeam2) {
      await mutateFunction({
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
            items={teams.map((team) => ({
              label: team.name,
              value: team,
            }))}
            onSelect={({ value }) => setPresetTeam1(value as Team)}
          />
        </div>
        <div className="flex flex-row items-center gap-4">
          <Label htmlFor="team2">Team 2</Label>
          <SearchableDropdown
            items={teams.map((team) => ({
              label: team.name,
              value: team,
            }))}
            onSelect={({ value }) => setPresetTeam2(value as Team)}
          />
        </div>
        <Button onClick={setPresetTeams}>
          {!isLoading ? "Save" : <LoaderPinwheel className="animate-spin" />}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ChoosePresetTeams;
