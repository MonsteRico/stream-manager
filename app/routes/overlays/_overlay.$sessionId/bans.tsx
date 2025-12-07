import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/serverFunctions";
import { NotFound } from "@/components/NotFound";
import BorderAnimation from "@/components/overlay/BorderAnimation";
import { OverwatchCharacters } from "@/lib/characters";
import { getGameLogoSrc } from "@/lib/utils";

export const Route = createFileRoute("/overlays/_overlay/$sessionId/bans")({
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
    component: BansOverlay,
});

function BansOverlay() {
    const { sessionId } = Route.useParams();
    const sessionQuery = useSuspenseQuery({
        ...sessionQueryOptions(sessionId),
        refetchInterval: 1000,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: true,
    });

    if (!sessionQuery.data) {
        return <NotFound>Session not found</NotFound>;
    }

    const session = sessionQuery.data;

    const team1BanCharacter = session.team1Ban
        ? OverwatchCharacters.find((char) => char.name === session.team1Ban)
        : null;
    const team2BanCharacter = session.team2Ban
        ? OverwatchCharacters.find((char) => char.name === session.team2Ban)
        : null;

    return (
        <BorderAnimation>
            <div className="flex flex-col items-center justify-center my-auto w-full h-full">
                <div className="flex flex-row items-center justify-center gap-16 w-full h-full z-30">
                    {/* Team 1 Ban */}
                    <div className="flex flex-col items-center gap-6">
                        {team1BanCharacter ? (
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={team1BanCharacter.image}
                                    alt={team1BanCharacter.name}
                                    className="w-80 h-80 object-contain"
                                />
                                <div className="flex flex-col items-center gap-2">
                                        <p className="text-4xl font-bold text-white font-overwatchOblique" style={{
                                            textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                                        }}>{team1BanCharacter.name}</p>
                                    <img
                                        src={`/characterImages/overwatch/${team1BanCharacter.role.toLowerCase()}.svg`}
                                        alt={team1BanCharacter.role}
                                        className="h-8 w-8"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-80 h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <p className="text-2xl text-gray-400">No ban</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-3 mt-2">
                            <img
                                src={session.team1Logo ?? getGameLogoSrc(session.game)}
                                alt={session.team1DisplayName}
                                className="h-20 w-auto"
                            />
                                <h2 className="text-3xl font-bold text-white font-overwatch" style={{
                                    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                                }}>{session.team1DisplayName}</h2>
                        </div>
                    </div>

                    {/* Team 2 Ban */}
                    <div className="flex flex-col items-center gap-6">
                        {team2BanCharacter ? (
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={team2BanCharacter.image}
                                    alt={team2BanCharacter.name}
                                    className="w-80 h-80 object-contain"
                                />
                                <div className="flex flex-col items-center gap-2">
                                        <p className="text-4xl font-bold text-white font-overwatchOblique" style={{
                                            textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                                        }}>{team2BanCharacter.name}</p>
                                    <img
                                        src={`/characterImages/overwatch/${team2BanCharacter.role.toLowerCase()}.svg`}
                                        alt={team2BanCharacter.role}
                                        className="h-8 w-8"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-80 h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <p className="text-2xl text-gray-400">No ban</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-3 mt-2">
                            <img
                                src={session.team2Logo ?? getGameLogoSrc(session.game)}
                                alt={session.team2DisplayName}
                                className="h-20 w-auto"
                            />
                                <h2 className="text-3xl font-bold text-white font-overwatch" style={{
                                    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                                }}>{session.team2DisplayName}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </BorderAnimation>
    );
}

