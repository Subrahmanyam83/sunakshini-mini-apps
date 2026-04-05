"use client";

export function AnimatedTitle() {
  return (
    <>
      <span
        className="text-xl font-extrabold tracking-tight"
        style={{
          background: "linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #fb923c, #a3e635, #34d399, #818cf8)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "rainbow 4s linear infinite, popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          filter: "drop-shadow(0 0 12px rgba(192,132,252,0.5))",
        }}
      >
        Sunakshini Mini Apps
      </span>
      <style>{`
        @keyframes rainbow {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.8) translateY(-6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
