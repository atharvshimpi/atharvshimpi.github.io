// ── PAGE ROUTING ───────────────────────────────────────────────
export type PageId =
  | 'home'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'contact'

// ── EXPERIENCE ─────────────────────────────────────────────────
export interface ExperienceEntry {
  company: string
  role: string
  dateRange: string
  location: string
  tag: string // e.g. "Full-time · Bengaluru", "Internship · Remote", "Volunteer · Karnataka"
  heading: string
  bullets: string[] // bullet text, may contain <strong> as plain markup string
  techTags: { label: string; outline?: boolean }[]
  certificateUrl?: string
}

export interface EducationEntry {
  school: string
  degree: string
  gpa: string
  duration: string
  courses: string
  badges: string[]
  yearMark: string // decorative large number in background, e.g. "2024"
}

// ── PROJECTS ───────────────────────────────────────────────────
export interface ProjectLink {
  label: string
  href: string
  icon?: 'github' | 'live' | 'apk'
  highlighted?: boolean
}

export interface ProjectEntry {
  number: string // "01", "02", "03"
  title: string
  description: string
  chips: string[]
  stack: string
  links?: ProjectLink[]
}

// ── RECOGNITION / AWARDS ───────────────────────────────────────
export interface RecognitionEntry {
  value: string // big number/label, e.g. "1st", "Top 0.5%"
  label: string
  sub: string
}

export interface AwardEntry {
  emoji: string
  label: string
  description: string
  org: string
  certificateUrl?: string
}

// ── SKILLS ─────────────────────────────────────────────────────
export type SkillCategoryId = 'languages' | 'frameworks' | 'aiCloud' | 'tools'

export interface SkillChip {
  label: string
  primary?: boolean
}

export interface SkillCategory {
  id: SkillCategoryId
  label: string
  chips: SkillChip[]
}

// ── CONTACT ────────────────────────────────────────────────────
export interface ContactLink {
  label: string
  href: string
  icon: 'email' | 'github' | 'linkedin' | 'leetcode'
}

// ── TYPING GAME EASTER EGG ─────────────────────────────────────
export type CommitMessage = string
