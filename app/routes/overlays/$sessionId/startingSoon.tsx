import BorderAnimation from "@/components/BorderAnimation";
import ImageAndTextOverlay from "@/components/ImageAndTextOverlay";
import MovingDots from "@/components/MovingDots";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
export const Route = createFileRoute("/overlays/$sessionId/startingSoon")({
    component: () => <ImageAndTextOverlay centerAlt="Purdue Esports Logo" centerImage="/images/purdueEsports.png" text="Starting Soon" />,
});
