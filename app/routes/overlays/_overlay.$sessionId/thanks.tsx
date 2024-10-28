import ImageAndTextOverlay from '@/components/ImageAndTextOverlay'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/_overlay/$sessionId/thanks')({
  component: () => (
    <ImageAndTextOverlay
      centerAlt="Purdue Esports Logo"
      centerImage="/images/purdueEsports.png"
      text="Thanks for watching!"
    />
  ),
})
