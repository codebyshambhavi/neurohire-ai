import type { Metadata } from "next"
import { InterviewRoom } from "@/components/interview/interview-room"

export const metadata: Metadata = {
  title: "Interview Room — NeuroHire AI",
  description: "Your live AI-powered mock interview session.",
}

export default function InterviewRoomPage() {
  return <InterviewRoom />
}
