import ImageAndTextOverlay from '@/components/overlay/ImageAndTextOverlay'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/_overlay/$sessionId/brb')({
  component: () => (
    <ImageAndTextOverlay
      centerAlt="Purdue Esports Logo"
      centerImage="/images/purdueEsports.png"
      text="Be Right Back"
    />
  ),
})
