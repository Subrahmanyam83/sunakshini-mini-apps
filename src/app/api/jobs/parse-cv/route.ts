import { NextRequest, NextResponse } from "next/server";

const SKILL_KEYWORDS = [
  // Languages
  "JavaScript","TypeScript","Python","Java","C#","C++","Go","Rust","Swift","Kotlin","PHP","Ruby","Scala","R",
  // Frontend
  "React","Next.js","Vue","Angular","Svelte","HTML","CSS","Tailwind","Redux","GraphQL","REST",
  // Backend
  "Node.js","Express","FastAPI","Django","Spring","Laravel","Rails","NestJS","Prisma",
  // Cloud & DevOps
  "AWS","Azure","GCP","Docker","Kubernetes","Terraform","CI/CD","Jenkins","GitHub Actions","Linux",
  // Databases
  "PostgreSQL","MySQL","MongoDB","Redis","DynamoDB","Elasticsearch","Cassandra","SQLite","Firebase","Supabase",
  // AI/ML
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","OpenAI","LLM","NLP","Data Science","Pandas","NumPy",
  // Mobile
  "React Native","Flutter","iOS","Android","Expo",
  // Tools
  "Git","Jira","Figma","Postman","Webpack","Vite","Jest","Cypress",
  // Soft/Domain
  "Agile","Scrum","Product Management","Leadership","Architecture","Microservices","System Design","API Design",
];

const ROLE_TO_TITLES: Record<string, string[]> = {
  "engineer": ["Software Engineer", "Senior Software Engineer", "Tech Lead", "Engineering Manager", "Staff Engineer"],
  "developer": ["Software Developer", "Full Stack Developer", "Senior Developer", "Tech Lead", "Engineering Manager"],
  "manager": ["Engineering Manager", "Senior Engineering Manager", "Director of Engineering", "VP Engineering"],
  "lead": ["Tech Lead", "Engineering Manager", "Principal Engineer", "Staff Engineer", "Director of Engineering"],
  "architect": ["Software Architect", "Principal Architect", "CTO", "VP Engineering", "Staff Engineer"],
  "product": ["Product Manager", "Senior Product Manager", "Director of Product", "VP of Product", "Chief Product Officer"],
  "data": ["Data Scientist", "Senior Data Scientist", "ML Engineer", "Data Engineer", "Head of Data"],
  "devops": ["DevOps Engineer", "SRE", "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer"],
  "designer": ["UX Designer", "Product Designer", "Senior Designer", "Design Lead", "Head of Design"],
  "analyst": ["Business Analyst", "Data Analyst", "Senior Analyst", "Product Analyst"],
  "cto": ["CTO", "VP Engineering", "Head of Engineering", "Chief Architect"],
  "director": ["Director of Engineering", "VP Engineering", "Head of Engineering", "Engineering Director"],
};

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) found.add(skill);
  }
  return Array.from(found);
}

function generateJobTitles(currentRole: string): string[] {
  const lower = currentRole.toLowerCase();
  for (const [keyword, titles] of Object.entries(ROLE_TO_TITLES)) {
    if (lower.includes(keyword)) return titles;
  }
  // Fallback — use the current role + common progressions
  return [currentRole, `Senior ${currentRole}`, `Lead ${currentRole}`, `Head of ${currentRole.replace(/^senior\s+/i, "")}`];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const currentRole = formData.get("currentRole") as string ?? "";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    const skills = extractSkills(text);
    const preferredRoles = generateJobTitles(currentRole);

    return NextResponse.json({ text, fileName: file.name, skills, preferredRoles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
