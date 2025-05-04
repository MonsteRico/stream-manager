import ImageAndTextOverlay from '@/components/overlay/ImageAndTextOverlay'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overlays/_overlay/$sessionId/blank')({
  component: () => (
    <ImageAndTextOverlay
      centerAlt=""
      centerImage=""
      text=""
    />
  ),
})
