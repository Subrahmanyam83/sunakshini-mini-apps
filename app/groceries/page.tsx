import Link from "next/link";
import { GroceryList } from "@/components/groceries/GroceryList";

export default function GroceriesPage() {
  return (
    <main className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full" style={{ background: "#059669" }}>
        <div className="w-full px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-emerald-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-white tracking-tight">Groceries</span>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 py-5">
        <GroceryList />
      </div>
    </main>
  );
}
