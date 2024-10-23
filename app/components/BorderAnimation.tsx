import { motion } from "framer-motion";
import React from "react";

const BorderAnimation = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            style={{
                overflow: "hidden",
            }}
            className="relative overflow-hidden! flex items-center justify-center h-screen z-10 before:absolute before:w-32 before:h-[150dvw] before:bg-gradient-to-b after:overflow-hidden before:from-[#cfb991] before:to-white before:animate-rotate after:absolute after:inset-1 after:rounded-lg after:bg-[url(/images/puggMousepad2.png)] after:z-0 after:h-[99.25dvh] after:w-[99.5dvw]  after:bg-cover"
        >
            {children}
        </div>
    );
};

export default BorderAnimation;
