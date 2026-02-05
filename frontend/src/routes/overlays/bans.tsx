import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSession } from "@/api/client";
import BorderAnimation from "@/components/overlay/BorderAnimation";
import { OverwatchCharacters, getGameLogoSrc } from "@stream-manager/shared";

export function BansOverlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  if (sessionQuery.isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!sessionQuery.data) {
    return <div className="text-white">Session not found</div>;
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
        <div className="flex flex-row items-center justify-center gap-16 qhd:gap-20 4k:gap-32 w-full h-full z-30">
          {/* Team 1 Ban */}
          <div className="flex flex-col items-center gap-6 qhd:gap-8 4k:gap-12">
            {team1BanCharacter ? (
              <div className="flex flex-col items-center gap-4 qhd:gap-5 4k:gap-8">
                <img
                  src={team1BanCharacter.image}
                  alt={team1BanCharacter.name}
                  className="w-80 h-80 qhd:w-[426px] qhd:h-[426px] 4k:w-[640px] 4k:h-[640px] object-contain"
                />
                <div className="flex flex-col items-center gap-2 qhd:gap-3 4k:gap-4">
                  <p
                    className="text-4xl qhd:text-5xl 4k:text-8xl font-bold text-white font-overwatchOblique"
                    style={{
                      textShadow:
                        "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                    }}
                  >
                    {team1BanCharacter.name}
                  </p>
                  <img
                    src={`/characterImages/overwatch/${team1BanCharacter.role.toLowerCase()}.svg`}
                    alt={team1BanCharacter.role}
                    className="h-8 w-8 qhd:h-10 qhd:w-10 4k:h-16 4k:w-16"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 qhd:gap-5 4k:gap-8">
                <div className="w-80 h-80 qhd:w-[426px] qhd:h-[426px] 4k:w-[640px] 4k:h-[640px] bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-2xl qhd:text-3xl 4k:text-4xl text-gray-400">No ban</p>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-3 qhd:gap-4 4k:gap-6 mt-2 qhd:mt-3 4k:mt-4">
              <img
                src={session.team1Logo ?? getGameLogoSrc(session.game)}
                alt={session.team1DisplayName}
                className="h-20 qhd:h-28 4k:h-40 w-auto"
              />
              <h2
                className="text-3xl qhd:text-4xl 4k:text-6xl font-bold text-white font-overwatch"
                style={{
                  textShadow:
                    "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                }}
              >
                {session.team1DisplayName}
              </h2>
            </div>
          </div>

          {/* Team 2 Ban */}
          <div className="flex flex-col items-center gap-6 qhd:gap-8 4k:gap-12">
            {team2BanCharacter ? (
              <div className="flex flex-col items-center gap-4 qhd:gap-5 4k:gap-8">
                <img
                  src={team2BanCharacter.image}
                  alt={team2BanCharacter.name}
                  className="w-80 h-80 qhd:w-[426px] qhd:h-[426px] 4k:w-[640px] 4k:h-[640px] object-contain"
                />
                <div className="flex flex-col items-center gap-2 qhd:gap-3 4k:gap-4">
                  <p
                    className="text-4xl qhd:text-5xl 4k:text-8xl font-bold text-white font-overwatchOblique"
                    style={{
                      textShadow:
                        "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                    }}
                  >
                    {team2BanCharacter.name}
                  </p>
                  <img
                    src={`/characterImages/overwatch/${team2BanCharacter.role.toLowerCase()}.svg`}
                    alt={team2BanCharacter.role}
                    className="h-8 w-8 qhd:h-10 qhd:w-10 4k:h-16 4k:w-16"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 qhd:gap-5 4k:gap-8">
                <div className="w-80 h-80 qhd:w-[426px] qhd:h-[426px] 4k:w-[640px] 4k:h-[640px] bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-2xl qhd:text-3xl 4k:text-4xl text-gray-400">No ban</p>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-3 qhd:gap-4 4k:gap-6 mt-2 qhd:mt-3 4k:mt-4">
              <img
                src={session.team2Logo ?? getGameLogoSrc(session.game)}
                alt={session.team2DisplayName}
                className="h-20 qhd:h-28 4k:h-40 w-auto"
              />
              <h2
                className="text-3xl qhd:text-4xl 4k:text-6xl font-bold text-white font-overwatch"
                style={{
                  textShadow:
                    "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                }}
              >
                {session.team2DisplayName}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </BorderAnimation>
  );
}
