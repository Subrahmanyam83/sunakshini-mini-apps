import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { HomeCards } from "@/components/HomeCards";

export default async function Home() {
  const user = await currentUser();
  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#f0f2f5" }}>
        <div className="flex flex-col items-center gap-6 text-center max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sunakshini Mini Apps" className="w-20 h-20 rounded-2xl shadow-md" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-800">Sunakshini Mini Apps</p>
            <p className="text-sm text-gray-400">Everyday life, made simple.</p>
          </div>
          <Link
            href="/login"
            className="h-11 px-8 rounded-2xl text-sm font-semibold text-white flex items-center justify-center"
            style={{ background: "#16a34a" }}
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f0f2f5" }}>
      {/* Safe-area spacer — on black-translucent PWA installs the page extends
          behind the status bar. This white spacer fills that gap so the status
          bar never shows the grey header. On "default" (opaque) installs the
          env() value is 0 and this div has zero height. */}
      <div style={{ height: "env(safe-area-inset-top)", background: "#f0f2f5", flexShrink: 0 }} />

      {/* 4px rainbow top accent */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)" }}
      />

      {/* Sticky header */}
      <div
        className="sticky z-20 flex-shrink-0"
        style={{
          top: "env(safe-area-inset-top)",
          background: "#c5cdd9",
          borderBottom: "1.5px solid #b4bdc9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <AnimatedTitle />
            {firstName && (
              <span className="text-[11px] font-semibold tracking-wide mt-[2px]" style={{ color: "#9ca3af" }}>
                Welcome back, {firstName}
              </span>
            )}
          </div>
          <UserButton />
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1" style={{ background: "#f0f2f5" }}>
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: "#c4c9d4" }}>
            Your Apps
          </p>
          <HomeCards />
        </div>
      </div>
    </main>
  );
}
