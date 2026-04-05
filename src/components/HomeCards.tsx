"use client";

import Link from "next/link";

type App = {
  href: string;
  name: string;
  description: string;
  gradient: string;
  glowColor: string;
  icon: React.ReactNode;
  index: number;
};

function BeerIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <rect x="8" y="10" width="13" height="18" rx="3" fill="url(#beer-body)" />
      <rect x="21" y="13" width="5" height="9" rx="2.5" fill="url(#beer-handle)" />
      <rect x="8" y="6" width="13" height="5" rx="2" fill="url(#beer-foam)" />
      <rect x="10" y="14" width="2" height="10" rx="1" fill="white" opacity="0.25" />
      <defs>
        <linearGradient id="beer-body" x1="8" y1="10" x2="21" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="beer-handle" x1="21" y1="13" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="beer-foam" x1="8" y1="6" x2="21" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <path d="M4 5h3.5l3.2 13h12l3-9H10.5" stroke="url(#cart-stroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="25" r="2" fill="url(#cart-wheel)" />
      <circle cx="22" cy="25" r="2" fill="url(#cart-wheel2)" />
      <defs>
        <linearGradient id="cart-stroke" x1="4" y1="5" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="cart-wheel" x1="12" y1="23" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="cart-wheel2" x1="20" y1="23" x2="24" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <ellipse cx="16" cy="18" rx="9" ry="10" fill="url(#bowl-body)" />
      <path d="M7 18 Q16 11 25 18" stroke="url(#bowl-rim)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="15" r="2.5" fill="url(#veg1)" />
      <circle cx="17" cy="13" r="2" fill="url(#veg2)" />
      <circle cx="20" cy="16" r="2.5" fill="url(#veg3)" />
      <defs>
        <linearGradient id="bowl-body" x1="7" y1="14" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fda4af" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="bowl-rim" x1="7" y1="18" x2="25" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb7185" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="veg1" x1="9.5" y1="12.5" x2="14.5" y2="17.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="veg2" x1="15" y1="11" x2="19" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="veg3" x1="17.5" y1="13.5" x2="22.5" y2="18.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fed7aa" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <rect x="5" y="12" width="22" height="15" rx="3" fill="url(#job-bg)" />
      <path d="M11 12V10a5 5 0 0 1 10 0v2" stroke="url(#job-strap)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="13" y="16" width="6" height="4" rx="1.5" fill="url(#job-buckle)" />
      <path d="M5 18h22" stroke="white" strokeWidth="1.2" opacity="0.2" />
      <defs>
        <linearGradient id="job-bg" x1="5" y1="12" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="job-strap" x1="11" y1="10" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="job-buckle" x1="13" y1="16" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const appDefs = [
  {
    href: "/alcohol",
    name: "Alcohol Tracker",
    description: "Track drinks & monitor weekly intake",
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
    glowColor: "rgba(251,191,36,0.45)",
    bgGlow: "rgba(251,191,36,0.15)",
    icon: <BeerIcon />,
    hideInCountries: ["IN"],
  },
  {
    href: "/groceries",
    name: "Groceries",
    description: "Manage your shopping list & bought items",
    gradient: "from-emerald-400 via-teal-500 to-green-400",
    glowColor: "rgba(52,211,153,0.45)",
    bgGlow: "rgba(52,211,153,0.12)",
    icon: <CartIcon />,
  },
  {
    href: "/nutrition",
    name: "My Nutrition",
    description: "Daily meals, calories & burn for your family",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-400",
    glowColor: "rgba(244,63,94,0.45)",
    bgGlow: "rgba(244,63,94,0.12)",
    icon: <NutritionIcon />,
  },
  {
    href: "/jobs",
    name: "Job Finder",
    description: "Daily matches from LinkedIn, Indeed & more",
    gradient: "from-violet-500 via-purple-500 to-indigo-400",
    glowColor: "rgba(139,92,246,0.45)",
    bgGlow: "rgba(139,92,246,0.12)",
    icon: <JobIcon />,
  },
];

function AppCard({ app, index }: { app: typeof appDefs[0]; index: number }) {
  return (
    <Link href={app.href} className="block group" style={{ animationDelay: `${index * 80}ms` }}>
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-300 ease-out
          group-hover:scale-[1.025] group-hover:-translate-y-1 group-active:scale-[0.98]"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`,
        }}
      >
        {/* Animated glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${app.bgGlow} 0%, transparent 70%)`,
          }}
        />

        {/* Shine sweep */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
              transform: "translateX(-100%)",
              animation: "none",
            }}
          />
        </div>

        <div className="relative flex items-center gap-4 p-4 pr-5">
          {/* Icon container */}
          <div
            className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
            style={{
              background: `linear-gradient(135deg, var(--icon-from), var(--icon-to))`,
              boxShadow: `0 8px 24px -4px ${app.glowColor}, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            {/* Gradient via inline style vars trick */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${app.gradient}`}
              style={{ borderRadius: "inherit" }}
            />
            {/* Glass sheen on icon */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)",
              }}
            />
            <div className="relative z-10">{app.icon}</div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white tracking-tight leading-tight">{app.name}</p>
            <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
              {app.description}
            </p>
          </div>

          {/* Arrow */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
              group-hover:translate-x-0.5"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <svg className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomeCards({ hideAlcohol }: { hideAlcohol: boolean }) {
  const visible = appDefs.filter((a) => !(hideAlcohol && a.hideInCountries?.length));

  return (
    <div className="flex flex-col gap-3">
      {visible.map((app, i) => (
        <AppCard key={app.href} app={app} index={i} />
      ))}
    </div>
  );
}
