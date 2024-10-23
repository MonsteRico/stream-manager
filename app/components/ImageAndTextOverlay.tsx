import React from 'react'
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
    return (
        <BorderAnimation>
            <div className="flex flex-col items-center justify-center my-auto">
                <div className="justify-center items-center flex h-full w-full z-30 flex-col">
                    <img src={centerImage} alt={centerAlt} className={cn("w-64", centerImageClassName)} />
                    <p className={cn("text-black text-3xl font-bold bg-[#cfb991] px-4 py-1 rounded-lg", textClassName)}>{text}</p>
                </div>
                <MovingDots
                    backgroundColor="#d1d3d4"
                    startX={614}
                    startY={520}
                    endX={1225}
                    endY={240}
                    numDots={3}
                    repeatDelay={1.5}
                    staggerDelay={0.2}
                />
            </div>
        </BorderAnimation>
    );
}

export default ImageAndTextOverlay