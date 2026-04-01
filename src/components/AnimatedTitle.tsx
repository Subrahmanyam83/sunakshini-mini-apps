"use client";

import Image from "next/image";

export function AnimatedTitle() {
  return (
    <>
      <Image
        src="/Sunakshini Mini Apps-logo.png"
        alt="Sunakshini Mini Apps"
        height={36}
        width={180}
        style={{
          objectFit: "contain",
          animation: "popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
        priority
      />
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
