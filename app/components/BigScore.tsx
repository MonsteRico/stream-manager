import type { Session } from "@/db/schema";
import { getGameLogoSrc } from "@/lib/utils";
import React from "react";

function BigScore({
    game,
    team1Color,
    team1DisplayName,
    team1Logo,
    team1Record,
    team1Rank,
    team2Color,
    team2DisplayName,
    team2Logo,
    team2Record,
    team2Rank,
    team1Score,
    team2Score,
    team1Abbreviation,
    team2Abbreviation,
}: Session) {
    return (
        <div className="w-full flex flex-row px-8 h-[10%] justify-between mb-8 font-overwatch">
            <div className="flex flex-row items-center w-full h-full" style={{ backgroundColor: team1Color }}>
                <img src={team1Logo ?? getGameLogoSrc(game)} alt={team1DisplayName} className="h-16 p-2" />
                <div className="flex flex-row justify-between items-center w-full px-4">
                    <div className="flex flex-row items-end gap-4">
                        <h3 className="text-6xl font-bold">{team1Abbreviation != "" ? team1Abbreviation : team1DisplayName}</h3>
                        <div className="flex flex-col justify-between">
                            <h5 className="text-2xl font-bold">{team1Rank}</h5>
                            <h5 className="text-2xl font-bold">{team1Record}</h5>
                        </div>
                    </div>
                    <h3 className="text-6xl font-bold">{team1Score}</h3>
                </div>
            </div>
            <div className="flex flex-row-reverse items-center w-full h-full" style={{ backgroundColor: team2Color }}>
                <img src={team2Logo ?? getGameLogoSrc(game)} alt={team2DisplayName} className="h-16 p-2" />
                <div className="flex flex-row-reverse items-center justify-between w-full px-4">
                    <div className="flex flex-row-reverse items-end gap-4">
                        <h3 className="text-6xl font-bold">{team2Abbreviation != "" ? team2Abbreviation : team2DisplayName}</h3>
                        <div className="flex flex-col justify-between">
                            <h5 className="text-2xl font-bold">{team2Rank}</h5>
                            <h5 className="text-2xl font-bold">{team2Record}</h5>
                        </div>
                    </div>
                    <h3 className="text-6xl font-bold">{team2Score}</h3>
                </div>
            </div>
        </div>
    );
}

export default BigScore;
