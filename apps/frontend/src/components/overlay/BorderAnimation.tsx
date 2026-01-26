import React from "react";

interface BorderAnimationProps {
  children: React.ReactNode;
  clippath?: string;
}

const BorderAnimation = ({ children, clippath }: BorderAnimationProps) => {
  return (
    <div
      style={{
        overflow: "hidden",
        clipPath: clippath,
      }}
      className="relative overflow-hidden! flex items-center justify-center h-screen w-screen z-10 before:absolute before:w-32 before:h-[300%] before:bg-gradient-to-b after:overflow-hidden before:from-[#cfb991] before:to-white before:animate-rotate after:absolute after:inset-1 after:rounded-lg after:bg-[url(/images/puggMousepad2.png)] after:z-0 after:h-[99.25%] after:w-[99.5%] after:bg-cover"
    >
      {children}
    </div>
  );
};

export default BorderAnimation;
