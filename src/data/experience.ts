import type { ExperienceEntry, EducationEntry } from '../types'

export const experience: ExperienceEntry[] = [
  {
    company: 'Aurigo',
    role: 'Software Developer 1',
    dateRange: 'Aug 2024 — Present',
    location: 'Bengaluru',
    tag: 'Full-time · Bengaluru',
    heading:
      'Building enterprise SaaS, reporting infrastructure, and AI-powered experiences',
    bullets: [
      'Engineered a microservice-based dashboard integrating SSRS, Power BI, and an in-house reporting tool using Spring Boot, PostgreSQL, and React, exposing <strong>RESTful APIs</strong> and reducing report load times by <strong>40%</strong> across a platform serving <strong>30+ enterprise clients</strong>.',
      'Implemented asynchronous orchestration for a reporting platform using <strong>AWS SQS and Step Functions</strong>, following <strong>Agile/Scrum</strong> methodology with Spring Boot, React, and Django.',
      "Designed and deployed an <strong>AI conversational agent</strong> with real-time speech-to-text powered by Anthropic's Claude Sonnet via AWS Bedrock, automating manual dashboard creation and deployed to real users.",
      'Built a full-stack monitoring application using Spring Boot, React, and PostgreSQL for tracking automated database migrations across a <strong>multi-tenant SaaS platform</strong>.',
    ],
    techTags: [
      { label: 'Spring Boot' },
      { label: 'React' },
      { label: 'AWS Bedrock' },
      { label: 'Claude LLM' },
      { label: 'PostgreSQL' },
      { label: 'Multi-tenant SaaS' },
    ],
  },
  {
    company: 'Aurigo',
    role: 'Software Developer Intern',
    dateRange: 'Jan 2024 — Jul 2024',
    location: 'Bengaluru',
    tag: 'Internship · Bengaluru',
    heading: 'Eliminating friction in the developer workflow',
    bullets: [
      'Built a custom <strong>CLI tool using Gulp</strong> to automate icon font file generation, eliminating the IcoMoon dependency and cutting icon integration time by over <strong>70%</strong>.',
      'Optimised Webpack bundles by <strong>~75%</strong> through code splitting, tree shaking, chunking, and minification.',
      "Contributed to the <strong>Capital Planning</strong> product, gaining early exposure to Aurigo's core enterprise SaaS platform built with React and Spring Boot.",
    ],
    techTags: [
      { label: 'Webpack' },
      { label: 'Gulp' },
      { label: 'React' },
      { label: 'Developer Tooling' },
    ],
    certificateUrl:
      'https://drive.google.com/file/d/16-NyQM6OUc5UTzmYlk85lt1qN-mvYT8C/view?usp=sharing',
  },
  {
    company: 'RMIT University',
    role: 'Software Developer Intern',
    dateRange: 'Jul 2022 — Mar 2023',
    location: 'Remote',
    tag: 'Internship · Remote',
    heading: 'Building a research PWA that works everywhere, even offline',
    bullets: [
      'Engineered a <strong>Progressive Web App</strong> using React and Firebase to simulate and visualise human–microbial interactions for a university research team.',
      'Achieved a <strong>95+ Lighthouse performance score</strong> and implemented Service Workers for offline gameplay, improving load speeds by up to <strong>60%</strong>.',
    ],
    techTags: [
      { label: 'React' },
      { label: 'Firebase' },
      { label: 'PWA' },
      { label: 'Service Workers' },
    ],
    certificateUrl:
      'https://drive.google.com/file/d/1RHhFOO1InwmVsBX_QqXwkRlvElMTUNGj/view?usp=sharing',
  },
  {
    company: 'Indian Red Cross Society',
    role: 'Summer Intern',
    dateRange: 'May 2022 — Jul 2022',
    location: 'Karnataka',
    tag: 'Volunteer · Karnataka',
    heading: 'Building a web presence for the Youth Red Cross Society',
    bullets: [
      'Designed and developed a dedicated website for the Youth Red Cross Society of Karnataka using React, focused on accessible content structure and SEO best practices.',
    ],
    techTags: [
      { label: 'React', outline: true },
      { label: 'JavaScript', outline: true },
      { label: 'SEO', outline: true },
    ],
  },
]

export const education: EducationEntry = {
  school: 'BITS Pilani · Goa, India',
  degree: 'B.E. (Hons.) Computer Science',
  gpa: '8.10 / 10',
  duration: 'Nov 2020 – Jul 2024',
  courses:
    'Data Structures & Algorithms · OOPS · DBMS · Operating Systems · Computer Networks',
  badges: ['Top 0.5% BITSAT Score', 'Academic Scholarship Holder · 8 Semesters'],
  yearMark: '2024',
}
