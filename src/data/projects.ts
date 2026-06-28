import type { ProjectEntry } from '../types'

export const projects: ProjectEntry[] = [
  {
    number: '01',
    title: 'AutoTest AI',
    description:
      'AI-powered MCQ assessment generation platform built on the MERN stack, with support for multiple LLM providers (Gemini, Groq, OpenAI, Claude) so users can choose their preferred model. Generates customised assessments from PDFs, text, or images instantly. Features timed test sessions and an interactive results dashboard with graphical scorecards.',
    chips: ['AI Generation', 'Assessment Platform', 'Analytics Dashboard'],
    stack: 'MERN · Multi-LLM Support',
    links: [
      { label: 'GitHub', href: '#', icon: 'github' },
      { label: '↗ Live', href: '#', icon: 'live', highlighted: true },
    ],
  },
  {
    number: '02',
    title: 'Form Builder AI',
    description:
      'AI-driven form digitisation system that converts rough, handwritten form images into structured XML/JSON schemas automatically. Uses YOLOv8 for control detection and classification, orchestrated via AWS SageMaker, AWS Bedrock, and AWS Lambda for a fully serverless pipeline.',
    chips: ['Computer Vision', 'Serverless', 'Document AI'],
    stack: 'YOLOv8 · AWS Bedrock · AWS SageMaker · AWS Lambda',
  },
  {
    number: '03',
    title: 'Financial Tracker',
    description:
      'Built a cross-platform mobile app in React Native with an offline-first architecture and secure local storage for personal expense tracking. Actively used by 5+ users.',
    chips: ['Cross Platform', 'Offline First', 'Data Visualisation'],
    stack: 'React Native · Expo',
    links: [
      { label: 'GitHub', href: '#', icon: 'github' },
      { label: '↓ APK', href: '#', icon: 'apk', highlighted: true },
    ],
  },
]
