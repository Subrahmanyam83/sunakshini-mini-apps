import Link from "next/link";
import { MasterList } from "@/components/groceries/MasterList";

export default function MasterListPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      {/* Header - fixed so it never scrolls away */}
      <div className="fixed top-0 left-0 right-0 z-10 w-full" style={{ background: "#059669" }}>
        <div className="w-full px-4 h-14 flex items-center gap-3">
          <Link href="/groceries" className="flex items-center gap-2 text-white transition-colors active:opacity-70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold tracking-tight">Master List</span>
          </Link>
          <span className="text-xs text-emerald-200 ml-auto">Tap + to add</span>
        </div>
      </div>

      {/* Content — offset by header height */}
      <div className="w-full px-4 pt-20 pb-8">
        <MasterList />
      </div>
    </div>
  );
}
