"use client";

import { useState, useEffect } from "react";
import { Job, JobProfile, AppliedJob } from "@/lib/use-jobs";

type ScoredJob = Job & { matchScore: number; matchedSkills: string[] };

type Props = {
  profile: JobProfile;
  appliedJobs: AppliedJob[];
  onApply: (job: Job) => Promise<void>;
};

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "#0a66c2",
  Indeed: "#003a9b",
  Glassdoor: "#0caa41",
  default: "#6366f1",
};

function scoreJob(job: Job, profile: JobProfile): { matchScore: number; matchedSkills: string[] } {
  const text = (job.title + " " + job.description).toLowerCase();

  // Skill overlap — up to 50 pts
  const matchedSkills = profile.skills.filter((s) => text.includes(s.toLowerCase()));
  const skillScore =
    profile.skills.length > 0
      ? Math.min((matchedSkills.length / profile.skills.length) * 100, 50)
      : 25;

  // Role alignment — 30 pts if any preferred role word appears in the job title
  const roleScore = profile.preferredRoles.some((role) => {
    const words = role.toLowerCase().split(" ").filter((w) => w.length > 3);
    return words.some((w) => job.title.toLowerCase().includes(w)) || text.includes(role.toLowerCase());
  })
    ? 30
    : 0;

  // Seniority alignment — up to 20 pts
  const titleLower = job.title.toLowerCase();
  const yoe = profile.yearsOfExperience;
  let seniorityScore = 10;
  if (yoe >= 8) {
    if (/senior|lead|principal|staff|head|director|vp|manager|architect/.test(titleLower))
      seniorityScore = 20;
    else if (/junior|entry|associate|intern/.test(titleLower)) seniorityScore = 0;
  } else if (yoe >= 4) {
    if (/senior|lead/.test(titleLower)) seniorityScore = 15;
    else if (/intern/.test(titleLower)) seniorityScore = 0;
  } else {
    if (/junior|entry|associate|intern/.test(titleLower)) seniorityScore = 20;
    else if (/senior|lead|principal|staff/.test(titleLower)) seniorityScore = 0;
  }

  return {
    matchScore: Math.round(Math.min(skillScore + roleScore + seniorityScore, 100)),
    matchedSkills,
  };
}

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#9ca3af";
}

function seenKey(role: string, location: string) {
  return `jobpulse_seen_${role}_${location}`.replace(/\s+/g, "_");
}

export function JobList({ profile, appliedJobs, onApply }: Props) {
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState(profile.preferredRoles[0] ?? "");
  const [activeLocation, setActiveLocation] = useState(profile.preferredLocations[0] ?? "");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  // Cover letter state
  const [clJobId, setClJobId] = useState<string | null>(null);
  const [clText, setClText] = useState("");
  const [clLoading, setClLoading] = useState(false);
  const [clError, setClError] = useState("");
  const [clCopied, setClCopied] = useState(false);

  useEffect(() => {
    if (activeRole) fetchJobs(activeRole, activeLocation);
  }, [activeRole, activeLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchJobs(role: string, location: string) {
    setLoading(true);
    setError("");
    setJobs([]);
    setNewCount(0);
    try {
      const res = await fetch(
        `/api/jobs/search?q=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const rawJobs: Job[] = json.jobs ?? [];
      const scored: ScoredJob[] = rawJobs
        .map((j) => ({ ...j, ...scoreJob(j, profile) }))
        .sort((a, b) => b.matchScore - a.matchScore);

      setJobs(scored);

      // New-job detection via localStorage
      const key = seenKey(role, location);
      const seen = new Set<string>(JSON.parse(localStorage.getItem(key) ?? "[]"));
      const fresh = scored.filter((j) => !seen.has(j.id)).length;
      setNewCount(fresh);

      // After 4 s mark all as seen
      setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(scored.map((j) => j.id)));
        setNewCount(0);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateCoverLetter(job: ScoredJob) {
    setClJobId(job.id);
    setClText("");
    setClError("");
    setClCopied(false);
    setClLoading(true);
    try {
      const res = await fetch("/api/jobs/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: profile.cvText,
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          candidateName: profile.fullName,
          candidateRole: profile.currentRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setClText(json.letter);
    } catch (err) {
      setClError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setClLoading(false);
    }
  }

  const appliedIds = new Set(appliedJobs.map((a) => a.jobId));
  const clJob = jobs.find((j) => j.id === clJobId);

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {profile.preferredRoles.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeRole === role ? "#4f46e5" : "#ede9fe",
              color: activeRole === role ? "white" : "#4f46e5",
            }}
          >
            {role}
          </button>
        ))}
        <button
          onClick={() => fetchJobs(activeRole, activeLocation)}
          className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-500 active:bg-gray-200"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Location selector */}
      {profile.preferredLocations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {profile.preferredLocations.map((loc) => (
            <button
              key={loc}
              onClick={() => setActiveLocation(loc)}
              className="flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeLocation === loc ? "#0f172a" : "#f1f5f9",
                color: activeLocation === loc ? "white" : "#64748b",
              }}
            >
              📍 {loc}
            </button>
          ))}
        </div>
      )}

      {/* New-job notification banner */}
      {newCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-center gap-2">
          <span className="text-base">🔔</span>
          <p className="text-xs font-medium text-indigo-700">
            {newCount} new {newCount === 1 ? "job" : "jobs"} since your last visit — sorted by best match
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-2xl p-4 text-sm text-red-600 text-center">
          {error.includes("RAPIDAPI_KEY") ? (
            <div className="space-y-1">
              <p className="font-semibold">RapidAPI key not configured</p>
              <p className="text-xs text-red-400">Add RAPIDAPI_KEY to your .env and Vercel settings</p>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400 text-sm">No jobs found. Try refreshing.</div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => {
          const isApplied = appliedIds.has(job.id);
          const isExpanded = expanded === job.id;
          const srcColor = SOURCE_COLORS[job.source] ?? SOURCE_COLORS.default;
          const matchClr = scoreColor(job.matchScore);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: matchClr }}
                    >
                      {job.matchScore}% match
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: srcColor }}
                    >
                      {job.source}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {job.location && <span>📍 {job.location}</span>}
                  {job.salary && <span>💰 {job.salary}</span>}
                  {job.postedAt && (
                    <span>🕐 {new Date(job.postedAt).toLocaleDateString("en-IN")}</span>
                  )}
                </div>

                {isExpanded && job.matchedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.matchedSkills.slice(0, 8).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}

                {isExpanded && (
                  <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-2 mt-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : job.id)}
                    className="text-xs text-indigo-400 active:opacity-70"
                  >
                    {isExpanded ? "Show less" : "Show description"}
                  </button>
                  {isExpanded && (
                    <button
                      onClick={() => generateCoverLetter(job)}
                      className="text-xs text-purple-500 font-medium active:opacity-70"
                    >
                      ✉️ Cover letter
                    </button>
                  )}
                </div>
              </div>

              <div className="flex border-t border-gray-50">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onApply(job)}
                  className="flex-1 py-2.5 text-xs font-semibold text-center transition-colors active:bg-indigo-50"
                  style={{ color: isApplied ? "#9ca3af" : "#4f46e5" }}
                >
                  {isApplied ? "✓ Applied" : "Apply Now →"}
                </a>
                <div className="w-px bg-gray-50" />
                <a
                  href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(job.company)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 text-xs font-medium text-center text-gray-400 active:bg-gray-50"
                >
                  View Company
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Applied jobs */}
      {appliedJobs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Applied ({appliedJobs.length})
          </p>
          {appliedJobs.map((a) => (
            <div
              key={a.jobId}
              className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3"
            >
              <span className="text-green-500 text-sm">✓</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{a.title}</p>
                <p className="text-xs text-gray-400">
                  {a.company} · {new Date(a.appliedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <a
                href={a.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400"
              >
                Open
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Cover letter bottom sheet */}
      {clJobId && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => {
            setClJobId(null);
            setClText("");
          }}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-h-[82vh] overflow-y-auto p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Cover Letter</p>
                {clJob && (
                  <p className="text-xs text-gray-400">
                    {clJob.title} · {clJob.company}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setClJobId(null);
                  setClText("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 active:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {clLoading && (
              <div className="flex items-center justify-center py-10 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-purple-500 animate-spin" />
                <span className="text-xs text-gray-400">Writing your cover letter…</span>
              </div>
            )}

            {clError && (
              <div className="bg-red-50 rounded-xl p-3 text-xs text-red-600">
                {clError.includes("ANTHROPIC_API_KEY")
                  ? "Add ANTHROPIC_API_KEY to your .env file to enable AI cover letters."
                  : clError}
              </div>
            )}

            {clText && (
              <>
                <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {clText}
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(clText);
                    setClCopied(true);
                    setTimeout(() => setClCopied(false), 2000);
                  }}
                  className="w-full h-11 rounded-2xl bg-indigo-600 text-white text-sm font-medium active:bg-indigo-700 transition-colors"
                >
                  {clCopied ? "✓ Copied!" : "Copy to clipboard"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
