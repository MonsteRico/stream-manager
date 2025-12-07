import type { NewSession } from "@/db/schema";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { updateSession } from "./serverFunctions";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getGameLogoSrc(game: string | null) {
    switch (game) {
        case "Overwatch":
            return "/images/gameLogos/overwatch.png";
        case "Splatoon":
            return "/images/gameLogos/splatoon.png";
        case "Rocket League":
            return "/images/gameLogos/rocket-league.png";
        case "Smash":
            return "/images/gameLogos/smash.png";
        case "Valorant":
            return "/images/gameLogos/valorant.webp";
        case "CS":
            return "/images/gameLogos/counter-strike-2.webp";
        case "League of Legends":
            return "/images/gameLogos/league-of-legends.png";
        case "Deadlock":
            return "/images/gameLogos/deadlock.png";
        case "Marvel Rivals":
            return "/images/gameLogos/rivals.jpg"
        default:
            return "/images/gameLogos/overwatch.png";
    }
}

export function extractSlug(url: string): string | null {
    // Regular expression to match the slug pattern
    const slugRegex = /https?:\/\/(?:www\.)?start\.gg(\/tournament\/[^\/]+\/event\/[^\/]+)/;

    // Try to match the regex against the URL
    const match = url.match(slugRegex);

    // If a match is found, return the captured group (the slug)
    // Otherwise, return null
    return match ? match[1] : null;
}


export function useUpdateSessionMutation(sessionId: string, options?: UseMutationOptions<unknown, unknown, NewSession>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["updateSession"],
        mutationFn: async ({
            name,
            team1DisplayName,
            game,
            mapInfo,
            bestOf,
            team2DisplayName,
            team1Color,
            team2Color,
            team1Logo,
            team2Logo,
            team1Score,
            team2Score,
            team1First,
            team1Abbreviation,
            team2Abbreviation,
            team1Record,
            team2Record,
            team1Rank,
            team2Rank,
            animationDelay,
            casters,
            team1Ban,
            team2Ban,
        }: NewSession) => {
            await updateSession({
                id: sessionId,
                name,
                team1DisplayName,
                team2DisplayName,
                team1Color,
                team2Color,
                team1Logo,
                team2Logo,
                team1Score,
                team2Score,
                game,
                mapInfo,
                bestOf,
                team1First,
                team1Abbreviation,
                team2Abbreviation,
                team1Record,
                team2Record,
                team1Rank,
                team2Rank,
                animationDelay,
                casters,
                team1Ban,
                team2Ban,
            });
        },

        onSettled: (data, error, variables, context) => {
            options?.onSettled?.(data, error, variables, context);
            queryClient.invalidateQueries({
                queryKey: ["session", sessionId],
            });
        },
        ...options,
    });
}
