import ImageAndTextOverlay from '@/components/overlay/ImageAndTextOverlay'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
export const Route = createFileRoute(
  '/overlays/_overlay/$sessionId/waitingForNext',
)({
  component: () => (
    <ImageAndTextOverlay
      centerAlt="Purdue Esports Logo"
      centerImage="/images/purdueEsports.png"
      text="Waiting for next matches!"
    />
  ),
})
