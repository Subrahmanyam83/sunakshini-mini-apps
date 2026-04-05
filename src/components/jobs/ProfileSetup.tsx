"use client";

import { useState, useRef } from "react";
import { JobProfile } from "@/lib/use-jobs";

type Props = {
  initial?: JobProfile | null;
  onSave: (profile: JobProfile) => Promise<void>;
};

export function ProfileSetup({ initial, onSave }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [currentRole, setCurrentRole] = useState(initial?.currentRole ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(String(initial?.yearsOfExperience ?? ""));
  const [preferredLocation, setPreferredLocation] = useState(initial?.preferredLocation ?? "");
  const [cvText, setCvText] = useState(initial?.cvText ?? "");
  const [cvFileName, setCvFileName] = useState(initial?.cvFileName ?? "");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(initial?.preferredRoles ?? []);
  const [parsing, setParsing] = useState(false);
  const [parseErr, setParseErr] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseErr("");
    try {
      const form = new FormData();
      form.append("cv", file);
      form.append("currentRole", currentRole);
      const res = await fetch("/api/jobs/parse-cv", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCvText(json.text);
      setCvFileName(json.fileName);
      setSkills(json.skills ?? []);
      setPreferredRoles(json.preferredRoles ?? []);
    } catch (err) {
      setParseErr(err instanceof Error ? err.message : "Failed to parse CV");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ fullName, currentRole, yearsOfExperience: Number(yearsOfExperience), skills, preferredRoles, preferredLocation, cvText, cvFileName });
    } finally {
      setSaving(false);
    }
  }

  const isValid = fullName && currentRole && cvText;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Your Profile</p>

        {[
          { label: "Full Name", value: fullName, set: setFullName, placeholder: "e.g. Subrahmanyam Rentala" },
          { label: "Current Role / Job Title", value: currentRole, set: setCurrentRole, placeholder: "e.g. Senior Software Engineer" },
          { label: "Years of Experience", value: yearsOfExperience, set: setYearsOfExperience, placeholder: "e.g. 10", type: "number" },
          { label: "Preferred Location", value: preferredLocation, set: setPreferredLocation, placeholder: "e.g. Hyderabad, Remote" },
        ].map(({ label, value, set, placeholder, type }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs text-gray-500">{label}</label>
            <input
              type={type ?? "text"}
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
              style={{ fontSize: "16px" }}
            />
          </div>
        ))}
      </div>

      {/* CV Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Upload CV <span className="text-xs font-normal text-gray-400">(PDF)</span></p>
          <p className="text-xs text-gray-400 mt-0.5">We'll auto-extract your skills and find the best matching job titles</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={parsing || !currentRole}
          className="w-full h-11 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 active:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {parsing ? (
            <><div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" /> Extracting skills & job titles…</>
          ) : cvFileName ? (
            <><span>📄</span> {cvFileName} — <span className="text-indigo-500">Replace</span></>
          ) : (
            <><span>📎</span> {currentRole ? "Choose PDF" : "Enter your role first"}</>
          )}
        </button>
        {parseErr && <p className="text-xs text-red-500">{parseErr}</p>}

        {cvText && !parsing && (
          <div className="space-y-2">
            <p className="text-xs text-green-600 font-medium">✓ CV parsed successfully</p>
            {skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Skills found ({skills.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {preferredRoles.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Job titles to search:</p>
                <div className="flex flex-wrap gap-1.5">
                  {preferredRoles.map((r) => (
                    <span key={r} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid || saving}
        className="w-full h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
        style={{ background: "#4f46e5" }}
      >
        {saving ? "Saving…" : initial ? "Update Profile" : "Save & Find Jobs"}
      </button>
    </div>
  );
}
