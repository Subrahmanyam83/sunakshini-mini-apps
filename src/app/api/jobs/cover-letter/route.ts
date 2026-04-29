import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { cvText, jobTitle, company, jobDescription, candidateName, candidateRole } =
    await req.json() as {
      cvText?: string;
      jobTitle: string;
      company: string;
      jobDescription?: string;
      candidateName?: string;
      candidateRole?: string;
    };

  const prompt = `Write a professional cover letter for this job application.

Candidate:
- Name: ${candidateName ?? "Candidate"}
- Current role: ${candidateRole ?? "Professional"}
- CV excerpt: ${cvText?.slice(0, 2000) ?? ""}

Job:
- Title: ${jobTitle}
- Company: ${company}
- Description: ${jobDescription?.slice(0, 1500) ?? ""}

Instructions: Write 3-4 paragraphs (~280 words). Start with "Dear Hiring Manager,".
Open with genuine enthusiasm for this specific role and company.
Highlight 2-3 concrete skills from the CV that directly match the job requirements.
Close with a clear call to action.
Be specific — avoid generic filler phrases.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Claude API ${res.status}: ${body}`);
    }
    const json = await res.json();
    const letter = (json.content?.[0]?.text ?? "").trim();

    return NextResponse.json({ letter });
  } catch (err) {
    console.error("[cover-letter]", err);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
