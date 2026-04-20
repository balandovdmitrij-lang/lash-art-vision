import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import type { EyeParams } from '../store/appStore'

let landmarker: FaceLandmarker | null = null

export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
  )

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'CPU', // GPU can fail on some devices
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })

  return landmarker
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

export function validatePhoto(
  imageData: ImageData,
  landmarks: { x: number; y: number; z: number }[]
): ValidationResult {
  const errors: string[] = []

  if (landmarks.length === 0) {
    return { ok: false, errors: ['Лицо не найдено. Убедись, что лицо занимает центр кадра'] }
  }

  const xs = landmarks.map((l) => l.x)
  const bboxW = Math.max(...xs) - Math.min(...xs)
  if (bboxW < 0.18) {
    errors.push('Подойди ближе к камере')
  }

  const brightness = getMeanBrightness(imageData, landmarks)
  if (brightness < 40) {
    errors.push('Найди лучшее освещение или встань у окна')
  }

  const sharpness = getSharpness(imageData, landmarks)
  if (sharpness < 30) {
    errors.push('Фото смазано. Держи телефон неподвижно')
  }

  const leftInner = landmarks[133]
  const rightInner = landmarks[362]
  const leftOuter = landmarks[33]
  const rightOuter = landmarks[263]

  if (leftInner && rightInner && leftOuter && rightOuter) {
    const faceWidth = Math.abs(leftOuter.x - rightOuter.x)
    const noseTip = landmarks[1]
    const eyeMidX = (leftInner.x + rightInner.x) / 2
    const yawRatio = Math.abs(noseTip.x - eyeMidX) / (faceWidth || 0.001)
    if (yawRatio > 0.2) {
      errors.push('Поверни голову прямо к камере')
    }
  }

  return { ok: errors.length === 0, errors }
}

function getMeanBrightness(
  imageData: ImageData,
  landmarks: { x: number; y: number }[]
): number {
  const { data, width, height } = imageData
  const xs = landmarks.map((l) => l.x * width)
  const ys = landmarks.map((l) => l.y * height)
  const x0 = Math.max(0, Math.floor(Math.min(...xs)))
  const y0 = Math.max(0, Math.floor(Math.min(...ys)))
  const x1 = Math.min(width, Math.ceil(Math.max(...xs)))
  const y1 = Math.min(height, Math.ceil(Math.max(...ys)))

  let sum = 0
  let count = 0
  const step = 3
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (y * width + x) * 4
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      count++
    }
  }
  return count > 0 ? sum / count : 128
}

function getSharpness(
  imageData: ImageData,
  landmarks: { x: number; y: number }[]
): number {
  const { data, width, height } = imageData
  const eyePts = [33, 133, 159, 145].map((i) => landmarks[i]).filter(Boolean)
  if (eyePts.length < 2) return 200

  const xs = eyePts.map((l) => l.x * width)
  const ys = eyePts.map((l) => l.y * height)
  const x0 = Math.max(0, Math.floor(Math.min(...xs)) - 15)
  const y0 = Math.max(0, Math.floor(Math.min(...ys)) - 15)
  const x1 = Math.min(width, Math.ceil(Math.max(...xs)) + 15)
  const y1 = Math.min(height, Math.ceil(Math.max(...ys)) + 15)

  const pixels: number[] = []
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4
      pixels.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    }
  }

  if (pixels.length === 0) return 200
  const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length
  const variance = pixels.reduce((a, b) => a + (b - mean) ** 2, 0) / pixels.length
  return variance
}

export function computeEyeParams(
  landmarks: { x: number; y: number; z: number }[]
): EyeParams {
  const leftTop = landmarks[159]
  const leftBottom = landmarks[145]
  const leftInner = landmarks[133]
  const leftOuter = landmarks[33]

  const eyeH = Math.abs(leftTop.y - leftBottom.y)
  const eyeW = Math.abs(leftOuter.x - leftInner.x) || 0.001
  const ratio = eyeH / eyeW

  const shape: EyeParams['shape'] =
    ratio > 0.42 ? 'round' : ratio < 0.26 ? 'narrow' : 'almond'

  const rightInner = landmarks[362]
  const rightOuter = landmarks[263]
  const innerY = (leftInner.y + rightInner.y) / 2
  const outerY = (leftOuter.y + rightOuter.y) / 2
  const diffPx = (outerY - innerY) * 1000

  const axis: EyeParams['axis'] =
    diffPx > 5 ? 'downturned' : diffPx < -5 ? 'upturned' : 'straight'

  const interocular = Math.abs(rightInner.x - leftInner.x)
  const spacingRatio = interocular / eyeW
  const spacing: EyeParams['spacing'] =
    spacingRatio < 0.85 ? 'close' : spacingRatio > 1.2 ? 'wide' : 'normal'

  const fold = landmarks[223]
  const lashLine = landmarks[145]
  const outerFold = landmarks[443]
  const hoodCenter = fold ? Math.abs(fold.y - lashLine.y) * 1000 : 30
  const hoodOuter = outerFold ? Math.abs(outerFold.y - lashLine.y) * 1000 : 30

  const hooding: EyeParams['hooding'] =
    hoodCenter < 12 && hoodOuter > 18 ? 'center'
    : hoodOuter < 12 ? 'diagonal'
    : 'none'

  const eyeCenterZ = (leftTop.z + leftBottom.z) / 2
  const depth: EyeParams['depth'] =
    eyeCenterZ < -0.04 ? 'deep' : eyeCenterZ > 0.02 ? 'convex' : 'normal'

  const leftH = Math.abs(landmarks[159].y - landmarks[145].y)
  const rightH = Math.abs(landmarks[386].y - landmarks[374].y)
  const symmetry = 1 - Math.abs(leftH - rightH) / ((leftH + rightH) || 0.001)

  return { shape, axis, spacing, hooding, depth, symmetry }
}
