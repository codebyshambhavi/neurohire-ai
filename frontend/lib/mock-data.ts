import type { LucideIcon } from 'lucide-react'
import { Brain, AudioLines, ScanFace, Gauge } from 'lucide-react'

export type Feature = {
  id: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: 'primary' | 'accent' | 'success' | 'chart4'
}

export const features: Feature[] = [
  {
    id: 'answermind',
    name: 'AnswerMind AI',
    tagline: 'NLP-powered answer evaluation',
    description:
      'Deep language models score technical relevance, concept coverage, and reasoning structure in every response.',
    icon: Brain,
    accent: 'primary',
  },
  {
    id: 'speechiq',
    name: 'SpeechIQ',
    tagline: 'Voice clarity & communication analytics',
    description:
      'Measures speaking pace, filler words, pauses, and fluency to sharpen how clearly you communicate.',
    icon: AudioLines,
    accent: 'accent',
  },
  {
    id: 'visionnet',
    name: 'VisionNet',
    tagline: 'Visual engagement intelligence',
    description:
      'Computer vision tracks attention consistency, posture, and on-camera presence throughout the session.',
    icon: ScanFace,
    accent: 'success',
  },
  {
    id: 'neuroscore',
    name: 'NeuroScore',
    tagline: 'Overall interview readiness scoring',
    description:
      'A single, calibrated readiness score fuses every signal so you always know where you stand.',
    icon: Gauge,
    accent: 'chart4',
  },
]

export const stats = [
  { label: 'Interviews analyzed', value: '2.4M+' },
  { label: 'Avg. score lift', value: '+34%' },
  { label: 'Enterprise teams', value: '480+' },
  { label: 'Signals per session', value: '120' },
]

export const pricing = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    description: 'Practice the fundamentals with core AI feedback.',
    features: ['5 mock interviews / mo', 'AnswerMind evaluation', 'Basic NeuroScore', 'Email support'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'Full multimodal analysis for serious candidates.',
    features: [
      'Unlimited interviews',
      'SpeechIQ + VisionNet',
      'Detailed report exports',
      'Personalized practice plans',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For bootcamps, universities, and hiring teams.',
    features: [
      'Team dashboards & SSO',
      'Custom question banks',
      'Cohort analytics',
      'API access',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export const howItWorks = [
  {
    step: '01',
    title: 'Configure your session',
    description: 'Pick your target role, experience level, difficulty, and interview type.',
  },
  {
    step: '02',
    title: 'Interview with AI',
    description: 'Answer adaptive questions on camera while our models capture 120+ signals live.',
  },
  {
    step: '03',
    title: 'Get your NeuroScore',
    description: 'Receive a multimodal breakdown of communication, technical depth, and engagement.',
  },
  {
    step: '04',
    title: 'Improve & repeat',
    description: 'Follow personalized practice recommendations and track your growth over time.',
  },
]

// ---------- Interview Room ----------

export const liveSignals = [
  { label: 'Clarity', value: 82, tone: 'primary' as const },
  { label: 'Pace', value: 76, tone: 'accent' as const },
  { label: 'Confidence', value: 88, tone: 'success' as const },
  { label: 'Eye contact', value: 79, tone: 'chart4' as const },
]

// ---------- Profile ----------

export const achievements = [
  { title: 'First Interview', description: 'Completed your first AI session', unlocked: true },
  { title: 'Streak x7', description: '7 days of practice in a row', unlocked: true },
  { title: 'Score 85+', description: 'Reached a NeuroScore above 85', unlocked: true },
  { title: 'Fluency Master', description: 'Under 5 filler words in a session', unlocked: true },
  { title: 'Marathon', description: '25 hours of total practice', unlocked: true },
  { title: 'Perfect Score', description: 'Hit a NeuroScore of 95+', unlocked: false },
]
