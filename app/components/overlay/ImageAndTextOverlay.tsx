import BorderAnimation from './BorderAnimation';
import MovingDots from './MovingDots';
import { cn } from '@/lib/utils';

function ImageAndTextOverlay({
    centerImage,
    centerImageClassName,
    centerAlt,
    text,
    textClassName,
}: {
    centerImage: string;
    centerImageClassName?: string;
    centerAlt: string;
    text: string;
    textClassName?: string;
}) {
    const startX = window.innerWidth * (624/1754);
    const endX = window.innerWidth * (1225/1754);
    const startY = window.innerHeight * (520/957);
    const endY = window.innerHeight * (240/957);
    return (
        <BorderAnimation>
            <div className="flex flex-col items-center justify-center my-auto">
                <div className="justify-center items-center flex h-full w-full z-30 flex-col">
                    <img src={centerImage} alt={centerAlt} className={cn("w-64", centerImageClassName)} />
                    <p className={cn("text-black text-3xl font-bold bg-[#cfb991] px-4 py-1 rounded-lg", textClassName)}>{text}</p>
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

export default ImageAndTextOverlay