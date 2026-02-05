import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSession } from "@/api/client";
import type { CasterInfo } from "@stream-manager/shared";
import CasterInfoCard from "@/components/overlay/CasterInfoCard";
import BorderAnimation from "@/components/overlay/BorderAnimation";

export function CastersSingleCameraPage() {
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
  const casters = session.casters as CasterInfo[];

  return (
    <BorderAnimation>
      <div className="flex flex-col items-center justify-end h-full pb-8 qhd:pb-10 4k:pb-16">
        <div className="flex flex-row items-end justify-center gap-8 qhd:gap-10 4k:gap-16 z-30">
          {casters.map((caster, index) => (
            <CasterInfoCard
              key={index}
              {...caster}
              delay={session.animationDelay + index * 0.1}
            />
          ))}
        </div>
      </div>
    </BorderAnimation>
  );
}
