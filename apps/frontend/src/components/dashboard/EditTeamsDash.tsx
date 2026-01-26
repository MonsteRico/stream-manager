import { useState, useEffect, useCallback } from "react";
import type { Session, MapInfo } from "@stream-manager/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Edit2, Link } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ChoosePresetTeams from "./ChoosePresetTeams";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UploadButton } from "@/lib/uploadthing";

interface EditTeamsDashProps {
  session: Session;
  mutateFn: (data: Partial<Session>) => void;
  mutateAsyncFn: (data: Partial<Session>) => Promise<unknown>;
}

function EditTeamsDash({
  session,
  mutateFn,
  mutateAsyncFn,
}: EditTeamsDashProps) {
  const [formState, setFormState] = useState<Partial<Session>>(session);
  const [teamOrder] = useState([1, 2]);
  const [editingTeam, setEditingTeam] = useState<null | 1 | 2>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormState((prev) => ({ ...prev, ...session }));
  }, [session]);

  const flipSides = () => {
    const tempTeam1Stuff = {
      displayName: formState.team1DisplayName,
      score: formState.team1Score,
      abbreviation: formState.team1Abbreviation,
      color: formState.team1Color,
      logo: formState.team1Logo,
      rank: formState.team1Rank,
      record: formState.team1Record,
      ban: formState.team1Ban,
    };

    const maps = (formState.mapInfo || []) as MapInfo[];
    const flippedMaps = maps.map((map) => ({
      ...map,
      winner:
        map.winner === "team1"
          ? ("team2" as const)
          : map.winner === "team2"
            ? ("team1" as const)
            : null,
      team1Ban: map.team2Ban,
      team2Ban: map.team1Ban,
    }));

    const newFormState = {
      ...formState,
      team1DisplayName: formState.team2DisplayName,
      team1Score: formState.team2Score,
      team1Abbreviation: formState.team2Abbreviation,
      team1Color: formState.team2Color,
      team1Logo: formState.team2Logo,
      team1Rank: formState.team2Rank,
      team1Record: formState.team2Record,
      team1Ban: formState.team2Ban,
      team2DisplayName: tempTeam1Stuff.displayName,
      team2Score: tempTeam1Stuff.score,
      team2Abbreviation: tempTeam1Stuff.abbreviation,
      team2Color: tempTeam1Stuff.color,
      team2Logo: tempTeam1Stuff.logo,
      team2Rank: tempTeam1Stuff.rank,
      team2Record: tempTeam1Stuff.record,
      team2Ban: tempTeam1Stuff.ban,
      team1First: true,
      mapInfo: flippedMaps,
    };
    setFormState(newFormState);
    setHasChanges(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleScoreChange = (team: 1 | 2, increment: boolean) => {
    const scoreKey = `team${team}Score` as "team1Score" | "team2Score";
    const currentScore = (formState[scoreKey] as number) || 0;
    const newScore = Math.max(0, currentScore + (increment ? 1 : -1));

    setFormState((prev) => {
      const updated = {
        ...prev,
        [scoreKey]: newScore,
      };

      if (increment && newScore > currentScore) {
        updated.team1Ban = null;
        updated.team2Ban = null;
      }

      return updated;
    });
    setHasChanges(true);
  };

  const handleTeamNameChange = (team: 1 | 2, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [`team${team}DisplayName`]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = useCallback(() => {
    mutateFn(formState);
    setHasChanges(false);
  }, [formState, mutateFn]);

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        handleSave();
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [handleSave]);

  function resetLogos() {
    setFormState((prev) => ({
      ...prev,
      team1Logo: null,
      team2Logo: null,
    }));
    setHasChanges(true);
  }

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Edit Teams
        </CardTitle>
        <div className="flex flex-row gap-2">
          <Button onClick={flipSides}>Flip Teams</Button>
          <ChoosePresetTeams
            sessionId={session.id}
            mutateFunction={mutateAsyncFn}
          />
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
                    value={
                      (formState[
                        `team${team}DisplayName` as keyof Session
                      ] as string) || ""
                    }
                    onChange={(e) =>
                      handleTeamNameChange(team as 1 | 2, e.target.value)
                    }
                    onBlur={() => setEditingTeam(null)}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors duration-200 flex-grow mr-4"
                    onClick={() => setEditingTeam(team as 1 | 2)}
                  >
                    {(formState[
                      `team${team}DisplayName` as keyof Session
                    ] as string) || ""}{" "}
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
                    {(formState[
                      `team${team}Score` as keyof Session
                    ] as number) || 0}
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
                    value={
                      (formState[
                        `team${team}Abbreviation` as keyof Session
                      ] as string) || ""
                    }
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
                    value={
                      (formState[
                        `team${team}Record` as keyof Session
                      ] as string) || ""
                    }
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
                    value={
                      (formState[
                        `team${team}Rank` as keyof Session
                      ] as string) || ""
                    }
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
                    value={
                      (formState[
                        `team${team}Color` as keyof Session
                      ] as string) || "#000000"
                    }
                    onChange={handleInputChange}
                    className="w-full h-10 p-1 bg-transparent border-2 border-gray-600 rounded"
                  />
                </div>
                <div className="flex-1">
                  <LogoEdit
                    team={team as 1 | 2}
                    formState={formState}
                    setFormState={setFormState}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
          disabled={!hasChanges}
        >
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
  formState: Partial<Session>;
  setFormState: React.Dispatch<React.SetStateAction<Partial<Session>>>;
}) {
  const handleLogoChange = (team: 1 | 2) => {
    const url = prompt("Enter logo URL:");
    if (url) {
      setFormState((prev) => ({
        ...prev,
        [`team${team}Logo`]: url,
      }));
    }
  };

  const logoKey = `team${team}Logo` as keyof Session;
  const logoValue = formState[logoKey] as string | null;

  return (
    <>
      <Label htmlFor={`team${team}Logo`}>Logo</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full h-10">
            {logoValue ? (
              <img
                src={logoValue}
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
            <Button onClick={() => handleLogoChange(team)}>
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
