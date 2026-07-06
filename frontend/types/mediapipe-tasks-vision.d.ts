declare module '@mediapipe/tasks-vision' {
  export type NormalizedLandmark = {
    x: number
    y: number
    z: number
    visibility?: number
  }

  export type FaceLandmarkerResult = {
    faceLandmarks?: NormalizedLandmark[][]
  }

  export class FilesetResolver {
    static forVisionTasks(wasmPath: string): Promise<unknown>
  }

  export class FaceLandmarker {
    static createFromOptions(vision: unknown, options: Record<string, unknown>): Promise<FaceLandmarker>
    detectForVideo(video: HTMLVideoElement, timestampMs: number): FaceLandmarkerResult
    close(): void
  }
}
