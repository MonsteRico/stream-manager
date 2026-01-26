import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fetchSession } from "@/api/client";
import type { CasterInfo } from "@stream-manager/shared";
import CasterInfoCard from "@/components/overlay/CasterInfoCard";
import BorderAnimation from "@/components/overlay/BorderAnimation";

export function CastersOverlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  const placeholderOneRef = useRef<HTMLDivElement>(null);
  const placeholderTwoRef = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState("");

  useEffect(() => {
    if (placeholderOneRef.current && placeholderTwoRef.current) {
      const {
        top: topOne,
        left: leftOne,
        width: widthOne,
        height: heightOne,
      } = placeholderOneRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const topOnePercent = (topOne / viewportHeight) * 100;
      const leftOnePercent = (leftOne / viewportWidth) * 100;
      const bottomOnePercent = ((topOne + heightOne) / viewportHeight) * 100;
      const rightOnePercent = ((leftOne + widthOne) / viewportWidth) * 100;

      const {
        top: topTwo,
        left: leftTwo,
        width: widthTwo,
        height: heightTwo,
      } = placeholderTwoRef.current.getBoundingClientRect();
      const topTwoPercent = (topTwo / viewportHeight) * 100;
      const leftTwoPercent = (leftTwo / viewportWidth) * 100;
      const bottomTwoPercent = ((topTwo + heightTwo) / viewportHeight) * 100;
      const rightTwoPercent = ((leftTwo + widthTwo) / viewportWidth) * 100;

      const newClipPath = `polygon(0% 0%, 0% 100%, ${leftOnePercent}% 100%, ${leftOnePercent}% ${topOnePercent}%, ${rightOnePercent}% ${topOnePercent}%, ${rightOnePercent}% ${bottomOnePercent}%, ${leftOnePercent}% ${bottomOnePercent}%, ${leftOnePercent}% 100%, ${leftTwoPercent}% 100%, ${leftTwoPercent}% ${topTwoPercent}%, ${rightTwoPercent}% ${topTwoPercent}%, ${rightTwoPercent}% ${bottomTwoPercent}%, ${leftTwoPercent}% ${bottomTwoPercent}%, ${leftTwoPercent}% 100%, 100% 100%, 100% 0%)`;

      setClipPath(newClipPath);
    }
  }, []);

  if (sessionQuery.isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!sessionQuery.data) {
    return <div className="text-white">Session not found</div>;
  }

  const session = sessionQuery.data;
  const casters = session.casters as CasterInfo[];

  const cameraWidth = window.innerWidth * 0.33;
  const cameraHeight = window.innerHeight * 0.7;

  const numCasters = casters.length;

  return (
    <BorderAnimation clippath={clipPath}>
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="flex h-full w-full z-30 flex-row items-baseline gap-8">
          {Array.from({ length: numCasters }).map((_, index) => (
            <div className="flex flex-col items-center" key={index}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-secondary mb-2 rounded-lg overflow-hidden"
                ref={index === 0 ? placeholderOneRef : placeholderTwoRef}
                style={{
                  width: cameraWidth,
                  height: cameraHeight,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-secondary-foreground">
                  Camera Feed
                </div>
              </motion.div>
              <CasterInfoCard {...casters[index]} delay={session.animationDelay} />
            </div>
          ))}
        </div>
      </div>
    </BorderAnimation>
  );
}
