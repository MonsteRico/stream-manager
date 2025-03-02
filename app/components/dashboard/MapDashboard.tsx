import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "../NotFound";
import type { MapInfo, NewSession } from "@/db/schema";
import type { UseMutateFunction } from "@tanstack/react-query";
import { useKey } from "@/lib/useKey";

interface MatchMapsDashboardProps {
	sessionId: string;
	gameMaps: MapInfo[];
	mutateFn: UseMutateFunction<unknown, unknown, NewSession, unknown>;
}

export default function MatchMapsDashboard({ sessionId, gameMaps, mutateFn }: MatchMapsDashboardProps) {
	const sessionQuery = useSuspenseQuery({
		...sessionQueryOptions(sessionId),
	});

	if (!sessionQuery.data) {
		return <NotFound>Session not found</NotFound>;
	}

	const session = sessionQuery.data;

	const [maps, setMaps] = useState<MapInfo[]>(session.mapInfo as MapInfo[]);
	const [hasChanges, setHasChanges] = useState(false);
	const [isBestOf, setIsBestOf] = useState(session.bestOf);

	const updateNumberOfMaps = (numberOfMaps: number) => {
		const newMaps: MapInfo[] = Array.from({ length: numberOfMaps }, (_, index) => ({
			id: Date.now() + index,
			name: "",
			winner: null,
			image: "",
			mode: null,
		}));
		setMaps(newMaps);
		setHasChanges(true);
	};

	const updateMap = (id: number, field: keyof MapInfo, value: string | null) => {
		const gameMap = gameMaps.find((map) => map.name === value);
		let newMaps = maps.map((map) => {
			if (map.id === id) {
				if (field === "name" && gameMap && value !== null) {
					console.log("THE MAP IS", gameMap);
					return { ...map, [field]: value, mode: gameMap.mode, image: gameMap.image };
				}
				if (field === "winner" && (value === "team1" || value === "team2" || value === null)) {
					return { ...map, [field]: value as "team1" | "team2" | null };
				}
			}
			return map;
		});
		console.log("THE MAPS ARE", newMaps);
		setMaps(newMaps);
		setHasChanges(true);
	};


	const handleSave = () => {
		mutateFn({
			mapInfo: maps,
			bestOf: isBestOf,
		});
		setHasChanges(false);
	};

    useKey("ctrls", handleSave);


	return (
		<Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-center">Match Maps Dashboard</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex items-center space-x-2">
							<Label htmlFor="numberOfMaps">Number of Maps</Label>
							<Select value={maps.length.toString()} onValueChange={(value) => updateNumberOfMaps(parseInt(value))}>
								<SelectTrigger id="numberOfMaps" className="w-[120px] bg-gray-600 border-gray-500">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 4, 5, 6, 7].map((num) => (
										<SelectItem key={num} value={num.toString()}>
											{num}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center space-x-2">
							<Label htmlFor="best-of-toggle">Play all</Label>
							<Switch
								id="best-of-toggle"
								checked={isBestOf}
								onCheckedChange={(checked) => {
									setIsBestOf(checked);
									setHasChanges(true);
								}}
							/>
							<Label htmlFor="best-of-toggle">Best of {maps.length}</Label>
						</div>
					</div>
					{maps.map((map, index) => (
						<div key={map.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">Map {index + 1}</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor={`map-${map.id}`}>Map Name</Label>
									<Select
										value={map.name}
										onValueChange={(value) => {
											updateMap(map.id, "name", value);
										}}>
										<SelectTrigger id={`map-${map.id}`} className="bg-gray-600 border-gray-500">
											<SelectValue placeholder="Select a map" />
										</SelectTrigger>
										<SelectContent>
											{gameMaps.map((option) => (
												<SelectItem key={option.id} value={option.name}>
													{option.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor={`winner-${map.id}`}>Winner</Label>
									<Select
										disabled={map.name === "TBD"}
										value={map.winner || ""}
										onValueChange={(value) => {
											const updatedValue = value === "clear" ? null : value;
											updateMap(map.id, "winner", updatedValue as "team1" | "team2" | null);
										}}>
										<SelectTrigger id={`winner-${map.id}`} className="bg-gray-600 border-gray-500">
											<SelectValue placeholder="Select winner" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="clear">No winner yet</SelectItem>
											<SelectItem value="team1">{session.team1DisplayName}</SelectItem>
											<SelectItem value="team2">{session.team2DisplayName}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					))}
					<Button type="button" onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!hasChanges}>
						Save Changes
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
