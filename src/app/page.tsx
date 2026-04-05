import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { HomeCards } from "@/components/HomeCards";

export default async function Home() {
  const [headersList, user] = await Promise.all([headers(), currentUser()]);
  const hideAlcohol = headersList.get("x-hide-alcohol") === "1";
  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#0a0a12" }}>
      {/* Aurora background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "60vw",
            height: "60vw",
            top: "-20vw",
            left: "-15vw",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            animation: "auroraBlob1 12s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "50vw",
            height: "50vw",
            bottom: "0",
            right: "-10vw",
            background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            animation: "auroraBlob2 15s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "40vw",
            height: "40vw",
            top: "40%",
            left: "30%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            animation: "auroraBlob3 10s ease-in-out infinite alternate",
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(10,10,18,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <AnimatedTitle />
            {firstName && (
              <span
                className="text-[11px] font-medium tracking-wide mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Hey {firstName} 👋
              </span>
            )}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
              padding: "2px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <UserButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Your Apps
          </p>
          <HomeCards hideAlcohol={hideAlcohol} />
        </div>
      </div>

      <style>{`
        @keyframes auroraBlob1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8vw, 6vw) scale(1.15); }
        }
        @keyframes auroraBlob2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6vw, -8vw) scale(1.1); }
        }
        @keyframes auroraBlob3 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-4vw, 5vw) scale(1.2); }
        }
      `}</style>
    </main>
  );
}
