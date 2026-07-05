'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Sparkles,
  ChevronRight,
  Loader2,
  Radio,
} from 'lucide-react'
import { liveSignals } from '@/lib/mock-data'
import { Waveform } from '@/components/interview/waveform'
import { NeuralViz } from '@/components/neural-viz'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { api, type InterviewResponse, type SessionQuestionResponse } from '@/lib/api'
import { cn } from '@/lib/utils'

type Phase = 'asking' | 'listening' | 'analyzing'

type SpeechRecognitionAlternativeLike = {
  transcript: string
}

type SpeechRecognitionResultLike = {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternativeLike
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
}

type BrowserWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

const toneClass: Record<string, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  chart4: 'bg-chart-4',
}

export function InterviewRoom({ interviewId }: { interviewId: string | null }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalTranscriptRef = useRef('')
  const speakingStartedAtRef = useRef<number | null>(null)
  const speakingDurationMsRef = useRef(0)
  const phaseRef = useRef<Phase>('asking')
  const micOnRef = useRef(true)
  const speechListeningRef = useRef(false)

  const [session, setSession] = useState<SessionQuestionResponse | null>(null)
  const [interview, setInterview] = useState<InterviewResponse | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('asking')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [camReady, setCamReady] = useState(false)
  const [camError, setCamError] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechListening, setSpeechListening] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)

  const question = session?.question ?? null
  const index = session?.question_index ?? 0
  const totalQuestions = session?.total_questions ?? 0
  const isLast = session?.is_last ?? false

  const closeSpeakingSegment = useCallback(() => {
    if (speakingStartedAtRef.current === null) return
    speakingDurationMsRef.current += Date.now() - speakingStartedAtRef.current
    speakingStartedAtRef.current = null
  }, [])

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    try {
      recognition.start()
    } catch {
      // Ignore duplicate start calls while recognition is already active.
    }
  }, [])

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    try {
      recognition.stop()
    } catch {
      // Ignore stop errors if recognition is already stopped.
    }
  }, [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    micOnRef.current = micOn
  }, [micOn])

  useEffect(() => {
    speechListeningRef.current = speechListening
  }, [speechListening])

  useEffect(() => {
    if (!interviewId) {
      setError('No interview was selected. Start a new interview to continue.')
      setLoading(false)
      return
    }

    const currentInterviewId = interviewId
    let cancelled = false

    async function loadSession() {
      try {
        const [interviewData, sessionData] = await Promise.all([
          api.interview(currentInterviewId),
          api.sessionQuestion(currentInterviewId),
        ])

        if (cancelled) return

        if (sessionData.is_complete) {
          await api.finishSession(currentInterviewId)
          router.replace(`/report?interviewId=${encodeURIComponent(currentInterviewId)}`)
          return
        }

        setInterview(interviewData)
        setSession(sessionData)
      } catch (caughtError: unknown) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load the interview session.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [interviewId, router])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const browserWindow = window as BrowserWindow
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition
    if (!Recognition) {
      setSpeechSupported(false)
      return
    }

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onstart = () => {
      setIsRecording(true)
      setSpeechError(null)
      speakingStartedAtRef.current = Date.now()
    }
    recognition.onend = () => {
      closeSpeakingSegment()
      setIsRecording(false)
      if (speechListeningRef.current && phaseRef.current === 'listening' && micOnRef.current) {
        startRecognition()
      }
    }
    recognition.onerror = (event) => {
      closeSpeakingSegment()
      setIsRecording(false)
      setSpeechError(event.error ? `Speech recognition error: ${event.error}` : 'Speech recognition error.')
    }
    recognition.onresult = (event) => {
      let finalText = finalTranscriptRef.current
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0]?.transcript?.trim() ?? ''
        if (!transcript) continue

        if (result.isFinal) {
          finalText = [finalText, transcript].filter(Boolean).join(' ').trim()
        } else {
          interimText = [interimText, transcript].filter(Boolean).join(' ').trim()
        }
      }

      finalTranscriptRef.current = finalText
      setAnswer([finalText, interimText].filter(Boolean).join(' ').trim())
    }

    recognitionRef.current = recognition
    setSpeechSupported(true)

    return () => {
      stopRecognition()
      recognitionRef.current = null
    }
  }, [closeSpeakingSegment, startRecognition, stopRecognition])

  // Camera
  useEffect(() => {
    let stream: MediaStream | null = null
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCamReady(true)
        }
      } catch {
        setCamError(true)
      }
    }
    if (camOn) start()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [camOn])

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Phase machine: ask -> listen -> analyze
  useEffect(() => {
    if (phase === 'asking') {
      const t = setTimeout(() => setPhase('listening'), 2600)
      return () => clearTimeout(t)
    }
  }, [phase, index])

  useEffect(() => {
    if (phase === 'listening') {
      return
    }

    if (speechListeningRef.current) {
      setSpeechListening(false)
    }
    if (isRecording) {
      stopRecognition()
    }
    closeSpeakingSegment()
  }, [closeSpeakingSegment, isRecording, phase, stopRecognition])

  const startSpeaking = useCallback(() => {
    if (!speechSupported || !micOn || phase !== 'listening') {
      return
    }

    finalTranscriptRef.current = answer.trim()
    setSpeechListening(true)
    setSpeechError(null)
    startRecognition()
  }, [answer, micOn, phase, speechSupported, startRecognition])

  const stopSpeaking = useCallback(() => {
    setSpeechListening(false)
    stopRecognition()
    closeSpeakingSegment()
  }, [closeSpeakingSegment, stopRecognition])

  useEffect(() => {
    stopSpeaking()
    finalTranscriptRef.current = ''
    speakingDurationMsRef.current = 0
    speakingStartedAtRef.current = null
    setSpeechError(null)
  }, [question?.id, stopSpeaking])

  const finishAndNavigate = useCallback(async () => {
    if (!interviewId) return

    stopSpeaking()
    setPhase('analyzing')
    setError(null)

    try {
      await api.finishSession(interviewId)
      router.push(`/report?interviewId=${encodeURIComponent(interviewId)}`)
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to finish the interview.')
      setPhase('listening')
    }
  }, [interviewId, router, stopSpeaking])

  const advance = useCallback(async () => {
    if (!interviewId || !question || !answer.trim()) return

    stopSpeaking()
    closeSpeakingSegment()
    const durationSecondsRaw = speakingDurationMsRef.current / 1000
    const durationSeconds = Number(durationSecondsRaw.toFixed(2))

    setPhase('analyzing')
    setError(null)

    try {
      await api.submitAnswer(interviewId, {
        question_id: question.id,
        transcript: answer.trim(),
        duration_seconds: durationSeconds > 0 ? durationSeconds : undefined,
        face_detected: camOn && camReady && !camError,
      })

      await new Promise((resolve) => setTimeout(resolve, 1800))

      if (isLast) {
        await api.finishSession(interviewId)
        router.push(`/report?interviewId=${encodeURIComponent(interviewId)}`)
        return
      }

      const nextSession = await api.sessionQuestion(interviewId)
      setSession(nextSession)
      setAnswer('')
      setPhase('asking')
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit your answer.')
      setPhase('listening')
    }
  }, [answer, camError, camOn, camReady, closeSpeakingSegment, interviewId, isLast, question, router, stopSpeaking])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  if (loading || !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        {loading ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <p className="max-w-md text-center text-sm text-destructive" role="alert">
            {error ?? 'No interview question is available.'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            <Radio className="size-3 animate-pulse" />
            REC
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {mm}:{ss}
          </span>
        </div>
        <Badge variant="muted">
          Question {index + 1} of {totalQuestions}
        </Badge>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <Sparkles className="size-4 text-primary" />
          {interview?.role_label} · {interview?.difficulty_label}
        </div>
      </header>

      {/* Progress */}
      <div className="h-1 w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-3">
        {/* AI interviewer */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 lg:col-span-2">
          <div className="relative flex flex-1 flex-col items-center justify-center p-8">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2">
                <NeuralViz />
              </div>
            </div>

            {/* AI orb */}
            <div className="relative">
              <div
                className={cn(
                  'flex size-32 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30 transition-all md:size-40',
                  phase === 'asking' && 'animate-pulse-ring',
                )}
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/25 md:size-24">
                  <Sparkles className="size-9 text-primary md:size-11" />
                </div>
              </div>
              {phase === 'asking' && (
                <span className="absolute -bottom-1 left-1/2 h-8 w-24 -translate-x-1/2">
                  <Waveform active className="h-full" />
                </span>
              )}
            </div>

            <p className="relative mt-8 text-sm font-medium text-primary">NeuroHire Interviewer</p>

            {/* Question */}
            <div className="relative mt-4 min-h-[7rem] max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <Badge className="mb-3">{question.type}</Badge>
                  <p className="text-balance text-xl font-medium leading-relaxed text-foreground md:text-2xl">
                    {question.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Status footer */}
          <div className="flex items-center justify-center gap-2 border-t border-border py-3 text-sm text-muted-foreground">
            {phase === 'asking' && (
              <>
                <Loader2 className="size-4 animate-spin text-primary" />
                Interviewer is speaking...
              </>
            )}
            {phase === 'listening' && (
              <>
                <span className="flex size-2 items-center justify-center">
                  <span className="size-2 animate-ping rounded-full bg-success" />
                </span>
                Listening to your answer — take your time
              </>
            )}
            {phase === 'analyzing' && (
              <>
                <Loader2 className="size-4 animate-spin text-primary" />
                Analyzing your response across 120+ signals...
              </>
            )}
          </div>
        </div>

        {/* Right column: candidate + live signals */}
        <div className="flex flex-col gap-4">
          {/* Candidate video */}
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                'size-full object-cover [transform:scaleX(-1)]',
                (!camOn || !camReady) && 'hidden',
              )}
            />
            {(!camOn || camError || !camReady) && (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                {camError ? (
                  <>
                    <VideoOff className="size-8" />
                    <p className="px-4 text-center text-xs">
                      Camera unavailable. You can still continue the interview.
                    </p>
                  </>
                ) : !camOn ? (
                  <>
                    <VideoOff className="size-8" />
                    <p className="text-xs">Camera off</p>
                  </>
                ) : (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                    <p className="text-xs">Connecting camera...</p>
                  </>
                )}
              </div>
            )}
            <span className="absolute bottom-2 left-2 rounded-md bg-background/70 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur">
              You
            </span>
            {micOn && camReady && (
              <span className="absolute bottom-2 right-2 h-6 w-16 opacity-80">
                <Waveform active={phase === 'listening'} className="h-full" />
              </span>
            )}
          </div>

          {/* Live signals */}
          <div className="flex-1 rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Live Signals</h3>
              <Badge variant="success">
                <span className="mr-1 size-1.5 rounded-full bg-success" />
                Live
              </Badge>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {liveSignals.map((s) => (
                <LiveSignal key={s.label} label={s.label} base={s.value} tone={s.tone} active={phase === 'listening'} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-3">
            <Input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer before continuing..."
              disabled={phase !== 'listening'}
              aria-label="Interview answer"
            />
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startSpeaking}
                disabled={!speechSupported || !micOn || phase !== 'listening' || speechListening}
                className="h-8"
              >
                Start Answer
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={stopSpeaking}
                disabled={!speechListening}
                className="h-8"
              >
                Finish Answer
              </Button>
              {speechListening && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success" aria-live="polite">
                  <span className="size-2 animate-pulse rounded-full bg-success" />
                  Listening...
                </span>
              )}
            </div>
            {error && (
              <p className="mt-2 text-xs text-destructive" role="alert" aria-live="polite">
                {error}
              </p>
            )}
            {!speechSupported && (
              <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                Voice input is unavailable in this browser. You can continue with typed answers.
              </p>
            )}
            {speechSupported && micOn && phase === 'listening' && speechListening && (
              <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                {isRecording ? 'Listening for live transcript...' : 'Initializing microphone...'}
              </p>
            )}
            {speechError && (
              <p className="mt-2 text-xs text-destructive" role="alert" aria-live="polite">
                {speechError}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card/50 p-3">
            <div className="flex gap-2">
              <ControlButton
                on={micOn}
                onClick={() => setMicOn((v) => !v)}
                onIcon={<Mic className="size-5" />}
                offIcon={<MicOff className="size-5" />}
                label="Toggle microphone"
              />
              <ControlButton
                on={camOn}
                onClick={() => setCamOn((v) => !v)}
                onIcon={<VideoIcon className="size-5" />}
                offIcon={<VideoOff className="size-5" />}
                label="Toggle camera"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={advance}
                disabled={phase !== 'listening' || !answer.trim()}
                size="lg"
                className="h-11"
              >
                {isLast ? 'Finish' : 'Next'}
                <ChevronRight className="size-4" />
              </Button>
              <button
                type="button"
                onClick={finishAndNavigate}
                disabled={phase === 'analyzing'}
                className="flex size-11 items-center justify-center rounded-lg bg-destructive text-destructive-foreground transition-opacity hover:opacity-90"
                aria-label="End interview"
              >
                <PhoneOff className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlButton({
  on,
  onClick,
  onIcon,
  offIcon,
  label,
}: {
  on: boolean
  onClick: () => void
  onIcon: React.ReactNode
  offIcon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={cn(
        'flex size-11 items-center justify-center rounded-lg transition-colors',
        on
          ? 'bg-muted text-foreground hover:bg-muted/70'
          : 'bg-destructive/15 text-destructive hover:bg-destructive/25',
      )}
    >
      {on ? onIcon : offIcon}
    </button>
  )
}

function LiveSignal({
  label,
  base,
  tone,
  active,
}: {
  label: string
  base: number
  tone: string
  active: boolean
}) {
  const [value, setValue] = useState(base)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setValue((v) => {
        const next = v + (Math.random() - 0.5) * 8
        return Math.max(55, Math.min(97, Math.round(next)))
      })
    }, 900)
    return () => clearInterval(id)
  }, [active])

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn('h-full rounded-full', toneClass[tone])}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}
