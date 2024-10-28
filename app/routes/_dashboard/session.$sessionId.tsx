// app/routes/index.tsxiimport { NotFound } from '@/components/NotFound'
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { sessionsTable, type NewSession, type Session } from "@/db/schema";
import { endSession, sessionQueryOptions, updateSession } from "@/lib/serverFunctions";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, redirect, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronUp, ChevronDown, Edit2, Upload, Link } from "lucide-react";
import debounce from "lodash.debounce";
import MatchMapsDashboard from "@/components/MapDashboard";
import { OverwatchMaps } from "@/lib/maps";
import OverlaysCard from "@/components/OverlaysCard";
import CasterDashboard from "@/components/CasterDashboard";
import { NotFound } from "@/components/NotFound";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChoosePresetTeams from "@/components/ChoosePresetTeams";
import { useUpdateSessionMutation } from "@/lib/utils";

const getSession = createServerFn("GET", async (id: string) => {
    try {
        const session = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, id),
        });
        return session;
    } catch (e) {
        throw redirect({
            to: "/",
        });
    }
});

// const updateCount = createServerFn('POST', async (addBy: number) => {
//   const count = await readCount()
//   await fs.promises.writeFile(filePath, `${count + addBy}`)
// })

export const Route = createFileRoute("/_dashboard/session/$sessionId")({
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
    component: SessionDashboard,
});

function SessionDashboard() {
    const router = useRouter();
    const { sessionId } = Route.useParams();
    const sessionQuery = useSuspenseQuery(sessionQueryOptions(sessionId));

    if (!sessionQuery.data) {
        return <NotFound>Session not found</NotFound>;
    }

    const [session, setSession] = useState<Session>(sessionQuery.data);
    const { mutate, mutateAsync } = useUpdateSessionMutation(sessionId, {
        onMutate: (variables) => {
            setSession({ ...session, ...variables });
        },
    });

    const [editingSession, setEditingSession] = useState(false);
    const [editingTeam, setEditingTeam] = useState<null | 1 | 2>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedInputChange(e.target.name, e.target.value);
    };

    const handleSelectChange = (name: string, value: string) => {
        console.log(name, value);
        mutate({
            [name]: value,
        });
    };

    const handleScoreChange = (team: 1 | 2, increment: boolean) => {
        mutate({
            [`team${team}Score`]: Math.max(0, session[`team${team}Score` as "team1Score" | "team2Score"] + (increment ? 1 : -1)),
        });
    };

    const debouncedSessionNameChange = useCallback(
        debounce((value: string) => {
            mutate({
                name: value,
            });
        }, 300),
        [],
    );

    const debouncedTeamNameChange = useCallback(
        debounce((team: 1 | 2, value: string) => {
            mutate({
                [`team${team}DisplayName`]: value,
            });
        }, 300),
        [],
    );

    const debouncedInputChange = useCallback(
        debounce((name: string, value: string) => {
            mutate({
                [name]: value,
            });
        }, 300),
        [],
    );

    const handleSessionNameChange = (value: string) => {
        debouncedSessionNameChange(value);
    };

    const handleTeamNameChange = (team: 1 | 2, value: string) => {
        debouncedTeamNameChange(team, value);
    };

    const handleLogoChange = (team: 1 | 2, type: "url" | "file") => {
        if (type === "url") {
            const url = prompt("Enter logo URL:");
            if (url) {
                mutate({
                    [`team${team}Logo`]: url,
                });
            }
        } else if (type === "file" && fileInputRef.current) {
            alert("I haven't finished allowing uploaded files yet use URLs for now");
            // fileInputRef.current.click();
            // fileInputRef.current.onchange = (e) => {
            //     const file = (e.target as HTMLInputElement).files?.[0];
            //     if (file) {
            //         const reader = new FileReader();
            //         reader.onload = (e) => {
            //             const result = e.target?.result;
            //             if (typeof result === "string") {
            //                 mutate({
            //                     [`team${team}Logo`]: result,
            //                 });
            //             }
            //         };
            //         reader.readAsDataURL(file);
            //     }
            // };
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Session updated:", session);
    };

    const [teamOrder, setTeamOrder] = useState([1, 2]);

    const flipSides = () => {
        setTeamOrder(teamOrder.reverse());
        mutate({
            team1First: !session.team1First,
        });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex flex-row justify-between">
                <div className="flex flex-col gap-2">
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
                    <div className="flex flex-row  items-center gap-2">
                        <Label htmlFor="game">Game</Label>
                        <Select name="game" value={session.game as string} onValueChange={(value) => handleSelectChange("game", value)}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 min-w-32">
                                <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Overwatch">Overwatch</SelectItem>
                                <SelectItem value="Splatoon">Splatoon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 container mx-auto p-4">
                <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Edit Teams</CardTitle>
                        <div className="flex flex-row gap-2">
                            <Button onClick={flipSides}>Flip Teams</Button>
                            <ChoosePresetTeams sessionId={sessionId} mutateFunction={mutateAsync} />
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
                                            <span className="text-3xl font-bold">
                                                {session[`team${team}Score` as "team1Score" | "team2Score"]}
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
                                                <PopoverContent className="w-40">
                                                    <div className="grid gap-4">
                                                        <Button onClick={() => handleLogoChange(team as 1 | 2, "url")}>
                                                            <Link className="mr-2 h-4 w-4" /> URL
                                                        </Button>
                                                        <Button onClick={() => handleLogoChange(team as 1 | 2, "file")}>
                                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </form>
            {session.game === "Overwatch" && <MatchMapsDashboard sessionId={sessionId} gameMaps={OverwatchMaps} />}
            <CasterDashboard sessionId={sessionId} />
            <OverlaysCard sessionId={sessionId} team1DisplayName={session.team1DisplayName} team2DisplayName={session.team2DisplayName} />
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" />
        </div>
    );
}
