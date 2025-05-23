import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Team } from "@/db/schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getStartGGTeams } from "@/lib/serverFunctions";
import { UploadButton } from "@/lib/uploadthing";
import { extractSlug } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/manageTeams")({
    component: TeamDashboard,
});

interface StartGGTeam {
    name: string;
    logo?: string;
}

export default function TeamDashboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [newTeam, setNewTeam] = useState<Omit<Team, "id">>({
        name: "",
        color: "#000000",
        logo: "",
        abbreviation: "",
        rank: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [eventURL, setEventURL] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const storedTeams = localStorage.getItem("myLocalTeams");
        if (storedTeams) {
            setTeams(JSON.parse(storedTeams));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewTeam((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newTeam.name || !newTeam.color || !newTeam.logo || !newTeam.abbreviation) {
            setError("Please fill in all required fields.");
            return;
        }

        const teamWithId = { ...newTeam, id: Date.now().toString() };
        const updatedTeams = [...teams, teamWithId];
        setTeams(updatedTeams);
        localStorage.setItem("myLocalTeams", JSON.stringify(updatedTeams));

        setNewTeam({
            name: "",
            color: "#000000",
            logo: "",
            abbreviation: "",
            rank: "",
        });
    };

    const removeTeam = (id: string) => {
        const updatedTeams = teams.filter((team) => team.id !== id);
        setTeams(updatedTeams);
        localStorage.setItem("myLocalTeams", JSON.stringify(updatedTeams));
    };

    const clearAllTeams = () => {
        setTeams([]);
        localStorage.removeItem("myLocalTeams");
    };

    const importTeams = async () => {
        setIsImporting(true);
        setError(null);
        try {
            const eventSlug = extractSlug(eventURL)
            if (!eventSlug) {
                window.alert("Something was wrong with the link, make sure it matches the example!")
                return;
            }
            const importedTeams = await getStartGGTeams(eventSlug);
            const newTeams = importedTeams.map((team) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: team.name,
                color: "#000000",
                logo: team.logo || "",
                abbreviation: team.name.substring(0, 3).toUpperCase(),
                rank: "",
            }));
            const updatedTeams = [...teams, ...newTeams];
            setTeams(updatedTeams);
            localStorage.setItem("myLocalTeams", JSON.stringify(updatedTeams));
            setEventURL("");
        } catch (err) {
            setError("Failed to import teams. Please try again.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Import Teams from start.gg</CardTitle>
                    <CardDescription>
                        This will import all the teams from a start.gg event. You can find the event slug in the URL of the event page. This
                        will only import the names and logos, so you will have to manually set anything else on the dashboard!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Paste start.gg event URL here (e.g. https://www.start.gg/tournament/deadlock-collegiate-series/event/dcs-season-0/overview)"
                            value={eventURL}
                            onChange={(e) => setEventURL(e.target.value)}
                        />
                        <Button onClick={importTeams} disabled={isImporting || !eventURL}>
                            {isImporting ? "Importing..." : "Import"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Add New Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name *</Label>
                            <Input id="name" name="name" value={newTeam.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Color *</Label>
                            <Input id="color" name="color" type="color" value={newTeam.color} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo *</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="logo"
                                    name="logo"
                                    value={newTeam.logo}
                                    onChange={handleInputChange}
                                    placeholder="Enter logo URL"
                                />
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <UploadButton
                                        className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
                                        endpoint="imageUploader"
                                        onClientUploadComplete={([{ url }]) => {
                                            setNewTeam((prev) => ({ ...prev, logo: url }));
                                            alert("Logo uploaded successfully!");
                                        }}
                                    />
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abbreviation">Abbreviation *</Label>
                            <Input
                                id="abbreviation"
                                name="abbreviation"
                                value={newTeam.abbreviation}
                                onChange={handleInputChange}
                                required
                                maxLength={5}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rank">Team Rank (Optional)</Label>
                            <Input id="rank" name="rank" value={newTeam.rank || ""} onChange={handleInputChange} />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full">
                            Add Team
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card className="w-full max-w-2xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Saved Teams</CardTitle>
                    <CardDescription>
                        Unfortunately you cannot edit locally saved teams. When you use the team on the dashboard, you can still edit the
                        values then.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => (
                            <div key={team.id} className="border rounded-lg p-4 flex flex-col items-center relative">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeTeam(team.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <img src={team.logo} alt={team.name} className="w-16 h-16 object-contain mb-2" />
                                <h3 className="font-bold">{team.name}</h3>
                                <p className="text-sm">{team.abbreviation}</p>
                                <div className="flex items-center mt-2">
                                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: team.color }}></div>
                                    <span className="text-xs">{team.color}</span>
                                </div>
                                {team.rank && <p className="text-sm mt-1">Rank: {team.rank}</p>}
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Clear All Teams</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all your saved teams.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearAllTeams}>Yes, delete all teams</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}