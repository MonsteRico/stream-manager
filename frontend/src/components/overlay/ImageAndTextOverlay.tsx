import BorderAnimation from "./BorderAnimation";
import MovingDots from "./MovingDots";
import { cn } from "@/lib/utils";

interface ImageAndTextOverlayProps {
  centerImage: string;
  centerImageClassName?: string;
  centerAlt: string;
  text: string;
  textClassName?: string;
}

function ImageAndTextOverlay({
  centerImage,
  centerImageClassName,
  centerAlt,
  text,
  textClassName,
}: ImageAndTextOverlayProps) {
  const startX = window.innerWidth * (624 / 1754);
  const endX = window.innerWidth * (1225 / 1754);
  const startY = window.innerHeight * (520 / 957);
  const endY = window.innerHeight * (240 / 957);

  return (
    <BorderAnimation>
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="justify-center items-center flex h-full w-full z-30 flex-col">
          {centerImage !== "" && (
            <img
              src={centerImage}
              alt={centerAlt}
              className={cn("w-64 qhd:w-[426px] 4k:w-[512px]", centerImageClassName)}
            />
          )}
          {text !== "" && (
            <p
              className={cn(
                "text-black text-3xl qhd:text-4xl 4k:text-6xl font-bold bg-[#cfb991] px-4 qhd:px-5 4k:px-8 py-1 qhd:py-1.5 4k:py-2 rounded-lg",
                textClassName
              )}
            >
              {text}
            </p>
          )}
        </div>
        <MovingDots
          backgroundColor="#d1d3d4"
          startX={startX}
          startY={startY}
          endX={endX}
          endY={endY}
          numDots={3}
          repeatDelay={1.5}
          staggerDelay={0.2}
        />
      </div>
    </BorderAnimation>
  );
}

export default ImageAndTextOverlay;
