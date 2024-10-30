import { motion } from "framer-motion";

interface MovingDotsProps {
    backgroundColor: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    numDots: number;
    staggerDelay: number;
    repeatDelay: number;
}

export default function MovingDots({
    backgroundColor = "#000000",
    startX = 0,
    startY = 0,
    endX = 100,
    endY = 100,
    numDots = 5,
    staggerDelay = 0.2,
    repeatDelay = 1,
}: MovingDotsProps) {
    return (
        <>
            {[...Array(numDots)].map((_, index) => (
                <motion.div
                    key={index}
                    className="w-4 h-4 rounded-full absolute z-20"
                    style={{
                        backgroundColor,
                        top: 0,
                        left: 0,
                        position:"absolute"
                    }}
                    initial={{
                        x: startX,
                        y: startY,
                        opacity: 1,
                        position: "absolute",
                    }}
                    animate={{
                        x: endX,
                        y: endY,
                        opacity: [1, 1, 1, 0],
                        position: "absolute",
                    }}
                    transition={{
                        duration: 4,
                        ease: "linear",
                        delay: index * staggerDelay,
                        repeat: Infinity,
                        repeatDelay: repeatDelay,
                    }}
                />
            ))}
        </>
    );
}
