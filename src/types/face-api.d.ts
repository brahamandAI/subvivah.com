declare module 'face-api.js' {
  export interface FaceDetection {
    score: number;
    box: Box;
    withFaceExpressions(): Promise<WithFaceExpressions<FaceDetection>>;
    withAgeAndGender(): Promise<WithAge<WithGender<FaceDetection>>>;
  }

  export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Gender {
    gender: 'male' | 'female';
    genderProbability: number;
  }

  export interface Age {
    age: number;
  }

  export interface WithFaceDetection<T> {
    detection: FaceDetection;
  }

  export interface WithAge<T> {
    age: number;
  }

  export interface WithGender<T> {
    gender: string;
    genderProbability: number;
  }

  export type WithFaceExpressions<T> = T & {
    expressions: {
      [key: string]: number;
    };
  }

  export class TinyFaceDetectorOptions {
    constructor(inputSize?: number, scoreThreshold?: number);
  }

  export function loadSsdMobilenetv1Model(url: string): Promise<void>;
  export function loadFaceLandmarkModel(url: string): Promise<void>;
  export function loadFaceRecognitionModel(url: string): Promise<void>;
  export function loadAgeGenderModel(url: string): Promise<void>;
  export function loadFaceExpressionModel(url: string): Promise<void>;

  export function detectSingleFace(input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, options?: TinyFaceDetectorOptions): Promise<FaceDetection | undefined>;
  export function detectAllFaces(input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, options?: TinyFaceDetectorOptions): Promise<FaceDetection[]>;

  export const nets: {
    ssdMobilenetv1: any;
    tinyFaceDetector: any;
    faceLandmark68Net: any;
    faceRecognitionNet: any;
    ageGenderNet: any;
    faceExpressionNet: any;
  };

  export const env: {
    getEnv(): string;
    setBackend(backend: string): void;
    monkeyPatch(env: any): void;
  };
} 