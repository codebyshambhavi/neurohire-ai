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

// ---------- Dashboard ----------

export const dashboardStats = [
  { label: 'Total Interviews', value: '48', delta: '+6 this month', trend: 'up' as const },
  { label: 'Average Score', value: '82', delta: '+4 pts', trend: 'up' as const },
  { label: 'Improvement', value: '+34%', delta: 'last 30 days', trend: 'up' as const },
  { label: 'Practice Time', value: '26h', delta: '+3.5h', trend: 'up' as const },
]

export const performanceData = [
  { month: 'Jan', score: 58, communication: 55 },
  { month: 'Feb', score: 63, communication: 60 },
  { month: 'Mar', score: 66, communication: 64 },
  { month: 'Apr', score: 71, communication: 68 },
  { month: 'May', score: 74, communication: 73 },
  { month: 'Jun', score: 79, communication: 77 },
  { month: 'Jul', score: 86, communication: 82 },
]

export const skillBreakdown = [
  { skill: 'Technical Depth', value: 88 },
  { skill: 'Communication', value: 82 },
  { skill: 'Problem Solving', value: 79 },
  { skill: 'Clarity', value: 74 },
]

export type Interview = {
  id: string
  role: string
  date: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  score: number
  improvement: number
}

export const recentInterviews: Interview[] = [
  { id: 'iv-1', role: 'ML Engineer', date: 'Jul 2, 2026', difficulty: 'Advanced', score: 86, improvement: 7 },
  { id: 'iv-2', role: 'Software Engineer', date: 'Jun 28, 2026', difficulty: 'Intermediate', score: 81, improvement: 4 },
  { id: 'iv-3', role: 'Data Analyst', date: 'Jun 24, 2026', difficulty: 'Intermediate', score: 78, improvement: -2 },
  { id: 'iv-4', role: 'Product Manager', date: 'Jun 19, 2026', difficulty: 'Advanced', score: 74, improvement: 5 },
  { id: 'iv-5', role: 'Software Engineer', date: 'Jun 12, 2026', difficulty: 'Beginner', score: 88, improvement: 9 },
]

export const recommendations = [
  {
    title: 'Improve explanation structure',
    detail: 'Use the STAR framework to give your technical answers a clearer beginning, middle, and end.',
    tag: 'AnswerMind',
  },
  {
    title: 'Reduce filler words',
    detail: 'You averaged 14 filler words per answer. Aim for under 6 by pausing instead of saying "um".',
    tag: 'SpeechIQ',
  },
  {
    title: 'Hold eye contact longer',
    detail: 'Attention consistency dipped mid-answer. Try looking into the camera when concluding a point.',
    tag: 'VisionNet',
  },
]

// ---------- Interview Room ----------

export const interviewQuestions = [
  {
    id: 'q1',
    type: 'Warm-up',
    text: 'To start, walk me through a machine learning project you are most proud of and your specific role in it.',
  },
  {
    id: 'q2',
    type: 'Technical',
    text: 'Explain the bias-variance tradeoff. How would you diagnose whether a model is underfitting or overfitting?',
  },
  {
    id: 'q3',
    type: 'Technical',
    text: 'You have a highly imbalanced classification dataset. What techniques would you use, and how would you evaluate the model?',
  },
  {
    id: 'q4',
    type: 'System Design',
    text: 'Design a system to serve real-time recommendations to 10 million daily users. Walk me through the architecture.',
  },
  {
    id: 'q5',
    type: 'Behavioral',
    text: 'Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?',
  },
]

export const liveSignals = [
  { label: 'Clarity', value: 82, tone: 'primary' as const },
  { label: 'Pace', value: 76, tone: 'accent' as const },
  { label: 'Confidence', value: 88, tone: 'success' as const },
  { label: 'Eye contact', value: 79, tone: 'chart4' as const },
]

// ---------- Report ----------

export const reportRadar = [
  { metric: 'Technical', value: 88 },
  { metric: 'Structure', value: 76 },
  { metric: 'Coverage', value: 82 },
  { metric: 'Fluency', value: 71 },
  { metric: 'Engagement', value: 85 },
  { metric: 'Clarity', value: 74 },
]

export const reportBreakdown = {
  answermind: [
    { label: 'Technical Relevance', value: 88 },
    { label: 'Concept Coverage', value: 82 },
    { label: 'Answer Structure', value: 76 },
  ],
  speechiq: [
    { label: 'Speaking Pace', value: 79 },
    { label: 'Pause Analysis', value: 73 },
    { label: 'Fluency', value: 71 },
  ],
  visionnet: [
    { label: 'Attention Consistency', value: 85 },
    { label: 'Engagement', value: 80 },
  ],
}

export const feedback = {
  strengths: [
    'Strong grasp of core ML fundamentals and trade-offs.',
    'Confident, well-paced delivery with minimal hesitation.',
    'Consistent on-camera presence and steady eye contact.',
  ],
  improve: [
    'Structure longer answers with an explicit summary at the end.',
    'Reduce filler words during transitions between ideas.',
    'Add concrete examples when explaining abstract concepts.',
  ],
  practice: [
    'Complete 3 "explain a concept" drills focused on structure.',
    'Record a 5-minute talk and review your filler-word count.',
    'Take one Advanced system-design mock this week.',
  ],
}

// ---------- Profile ----------

export const achievements = [
  { title: 'First Interview', description: 'Completed your first AI session', unlocked: true },
  { title: 'Streak x7', description: '7 days of practice in a row', unlocked: true },
  { title: 'Score 85+', description: 'Reached a NeuroScore above 85', unlocked: true },
  { title: 'Fluency Master', description: 'Under 5 filler words in a session', unlocked: true },
  { title: 'Marathon', description: '25 hours of total practice', unlocked: true },
  { title: 'Perfect Score', description: 'Hit a NeuroScore of 95+', unlocked: false },
]
