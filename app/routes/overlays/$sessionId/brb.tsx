import ImageAndTextOverlay from '@/components/ImageAndTextOverlay'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/$sessionId/brb')({
  component: () => <ImageAndTextOverlay centerAlt="Purdue Esports Logo" centerImage="/images/purdueEsports.png" text="Be Right Back" />,
})
