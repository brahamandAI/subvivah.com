"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Dynamic import for MediaPipe to handle WASM loading issues
let FaceMesh: any = null;

interface FaceVerificationProps {
  onNext?: (data: any) => void;
  onVerificationComplete?: (data: any) => void;
  onClose?: () => void;
}

const YAW_LEFT_THRESHOLD = -30;
const YAW_RIGHT_THRESHOLD = 30;
const STABLE_FRAME_THRESHOLD = 10;
const LIGHTING_THRESHOLD = 90;
const LIGHTING_MARGIN = 10;
const LIGHTING_CONSECUTIVE_FRAMES = 5;

const steps = [
  'Turn your head LEFT',
  'Turn your head RIGHT',
  'Look straight ahead',
];

const FaceVerification: React.FC<FaceVerificationProps> = ({ onNext, onVerificationComplete, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [yaw, setYaw] = useState(0);
  const [lighting, setLighting] = useState(0);
  const [prompt, setPrompt] = useState('Camera ready! Click "Start Verification" to begin');
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false); // Add ref to avoid closure issues
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [genderResult, setGenderResult] = useState<{ gender: string; confidence: number } | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const faceMeshRef = useRef<any>(null);
  const stableFramesRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [lastFrame, setLastFrame] = useState<{ image: ImageData | null, mesh: any[] | null }>({ image: null, mesh: null });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false); // Flag to prevent re-analysis
  const [guideAnimation, setGuideAnimation] = useState(0); // 0: left, 1: right, 2: center
  const [hasPlayedAnalysisBeep, setHasPlayedAnalysisBeep] = useState(false); // Prevent multiple beeps
  const [showContinueButton, setShowContinueButton] = useState(false); // Show continue button after completion
  
  // Add loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [faceDistance, setFaceDistance] = useState(0);
  const [faceCenterOffset, setFaceCenterOffset] = useState({ x: 0, y: 0 });
  
  // Live commentary system - only current status
  const [currentCommentary, setCurrentCommentary] = useState<string>('Camera ready');
  
  // Face positioning thresholds - Much more flexible for better user experience
  // These values have been significantly relaxed to reduce "hold still" frustration
  const FACE_DISTANCE_MIN = 0.05; // Minimum face size (too far) - much more relaxed
  const FACE_DISTANCE_MAX = 0.75; // Maximum face size (too close) - much more relaxed
  const FACE_CENTER_THRESHOLD = 0.40; // Maximum offset from center - much more relaxed

  // Add refs and state for hold timer
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const [isHoldActive, setIsHoldActive] = useState(false);
  const [hasSpokenHoldStill, setHasSpokenHoldStill] = useState(false);

  // Lighting smoothing state
  const [lowLightingFrames, setLowLightingFrames] = useState(0);

  // Add a helper to speak instructions using the browser's speech synthesis
  function speakInstruction(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.1;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  }

  // Speak the prompt whenever it changes to a new instruction
  const lastSpokenPromptRef = useRef<string>("");
  useEffect(() => {
    if (prompt && prompt !== lastSpokenPromptRef.current) {
      // Only speak if the prompt is a main instruction
      if (
        prompt.toLowerCase().includes('turn your head left') ||
        prompt.toLowerCase().includes('turn your head right') ||
        prompt.toLowerCase().includes('look straight') ||
        prompt.toLowerCase().includes('verification complete') ||
        prompt.toLowerCase().includes('move closer') ||
        prompt.toLowerCase().includes('move away') ||
        prompt.toLowerCase().includes('center your face')
      ) {
        speakInstruction(prompt);
        lastSpokenPromptRef.current = prompt;
      }
    }
  }, [prompt]);

  // Calculate yaw angle using face mesh landmarks
  // Invert the calculation to match user's natural movement (mirror effect)
  function computeYaw(landmarks: any[]): number {
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    const nose = landmarks[1];
    if (!leftEar || !rightEar || !nose) return 0;
    const faceWidth = Math.abs(rightEar.x - leftEar.x);
    const faceCenterX = (leftEar.x + rightEar.x) / 2;
    const noseX = nose.x;
    // Invert the result to match natural movement (when user turns left, we want negative yaw)
    return -((noseX - faceCenterX) / faceWidth) * 90;
  }

  function computeLighting(ctx: CanvasRenderingContext2D, w: number, h: number): number {
    const imgData = ctx.getImageData(0, 0, w, h);
    let sum = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      sum += (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    }
    return sum / (imgData.data.length / 4);
  }

  // Calculate face distance (size relative to canvas)
  function computeFaceDistance(landmarks: any[]): number {
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    const topHead = landmarks[10];
    const chin = landmarks[152];
    
    if (!leftEar || !rightEar || !topHead || !chin) return 0;
    
    const faceWidth = Math.abs(rightEar.x - leftEar.x);
    const faceHeight = Math.abs(chin.y - topHead.y);
    
    // Return average of width and height as face size relative to canvas
    return (faceWidth + faceHeight) / 2;
  }

  // Calculate face center offset from canvas center
  function computeFaceCenterOffset(landmarks: any[], canvasWidth: number, canvasHeight: number): { x: number, y: number } {
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    const topHead = landmarks[10];
    const chin = landmarks[152];
    
    if (!leftEar || !rightEar || !topHead || !chin) return { x: 0, y: 0 };
    
    const faceCenterX = (leftEar.x + rightEar.x) / 2;
    const faceCenterY = (topHead.y + chin.y) / 2;
    
    const canvasCenterX = 0.5;
    const canvasCenterY = 0.5;
    
    return {
      x: Math.abs(faceCenterX - canvasCenterX),
      y: Math.abs(faceCenterY - canvasCenterY)
    };
  }

  // Check if face is properly positioned
  function isFaceWellPositioned(distance: number, centerOffset: { x: number, y: number }): { isGood: boolean, message: string } {
    if (distance < FACE_DISTANCE_MIN) {
      return { isGood: false, message: 'Move closer to the camera' };
    }
    if (distance > FACE_DISTANCE_MAX) {
      return { isGood: false, message: 'Move away from the camera' };
    }
    if (centerOffset.x > FACE_CENTER_THRESHOLD || centerOffset.y > FACE_CENTER_THRESHOLD) {
      return { isGood: false, message: 'Center your face in the frame' };
    }
    return { isGood: true, message: 'Perfect positioning!' };
  }

  const updateStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const updated = [...prev];
      updated[stepIndex] = true;
      return updated;
    });
  };

  // Play beep sound
  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Helper to update step and ref together
  const updateStep = (newStep: number) => {
    setStep(newStep);
    stepRef.current = newStep;
  };

  // Update live commentary - only current status
  const updateCommentary = (message: string) => {
    setCurrentCommentary(message);
  };

  // Actual ML model analysis using face-api
  const performGenderAnalysisInternal = async (canvas: HTMLCanvasElement): Promise<{ gender: string; confidence: number }> => {
    try {
      // Convert canvas to video element for face-api analysis
      const video = document.createElement('video');
      video.width = canvas.width;
      video.height = canvas.height;
      
      // Create a temporary canvas to get video-like data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Cannot create temp canvas context');
      
      // Copy canvas data to temp canvas
      tempCtx.drawImage(canvas, 0, 0);
      
      // Import face analysis dynamically
      const { performGenderAnalysis } = await import('@/lib/face-analysis');
      
      // Use video element from our current stream
      if (videoRef.current) {
        const result = await performGenderAnalysis(videoRef.current);
        return {
          gender: result.gender,
          confidence: result.confidence
        };
      } else {
        throw new Error('Video element not available');
      }
    } catch (error) {
      console.error('Face-API analysis failed:', error);
      // Only reset the final step (step 2) and relevant state
      setPrompt('Face not detected, please look straight and hold still again.');
      updateCommentary('❌ Face not detected. Please look straight and hold still again.');
      speakInstruction('Face not detected, please look straight and hold still again.');
      setStep(2);
      stepRef.current = 2;
      setGenderResult(null);
      setVerificationComplete(false);
      setLastFrame({ image: null, mesh: null });
      setHasPlayedAnalysisBeep(false);
      setShowContinueButton(false);
      setAnalyzing(false);
      holdStartTimeRef.current = null;
      setIsHoldActive(false);
      setHasSpokenHoldStill(false);
      // Do not reset started, completedSteps, or left/right steps
      throw error; // Rethrow to prevent further processing
    }
  };

  // Improved guide animation function with clear directional guidance
  const drawGuideFace = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!started) return; // Only show guide when verification is active
    
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now();
    
    // Draw directional arrow with smooth animation
    const arrowSize = 60;
    const pulseScale = 1 + Math.sin(time * 0.005) * 0.2; // Smooth pulsing
    const glowIntensity = (Math.sin(time * 0.008) + 1) / 2; // Glowing effect
    
    ctx.save();
    
    if (step === 0) {
      // LEFT arrow - pointing left with animated movement
      const arrowX = centerX - 120;
      const arrowY = centerY - 80;
      
      // Glow effect
      ctx.shadowColor = `rgba(255, 105, 180, ${glowIntensity})`;
      ctx.shadowBlur = 20;
      
      // Draw animated left arrow
      ctx.fillStyle = `rgba(255, 105, 180, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(arrowX - arrowSize * pulseScale, arrowY);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.5 * pulseScale);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.5 * pulseScale);
      ctx.closePath();
      ctx.fill();
      
      // Add text instruction
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('← Turn LEFT', centerX, centerY + 120);
      
    } else if (step === 1) {
      // RIGHT arrow - pointing right with animated movement
      const arrowX = centerX + 120;
      const arrowY = centerY - 80;
      
      // Glow effect
      ctx.shadowColor = `rgba(64, 224, 208, ${glowIntensity})`;
      ctx.shadowBlur = 20;
      
      // Draw animated right arrow
      ctx.fillStyle = `rgba(64, 224, 208, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(arrowX + arrowSize * pulseScale, arrowY);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.5 * pulseScale);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY - arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX - arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.2 * pulseScale);
      ctx.lineTo(arrowX + arrowSize * 0.3 * pulseScale, arrowY + arrowSize * 0.5 * pulseScale);
      ctx.closePath();
      ctx.fill();
      
      // Add text instruction
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Turn RIGHT →', centerX, centerY + 120);
      
    } else if (step === 2) {
      // CENTER target - concentric circles showing "look straight"
      const targetSize = 40 * pulseScale;
      
      // Glow effect
      ctx.shadowColor = `rgba(50, 205, 50, ${glowIntensity})`;
      ctx.shadowBlur = 15;
      
      // Draw target circles
      ctx.strokeStyle = `rgba(50, 205, 50, 0.8)`;
      ctx.lineWidth = 4;
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY - 80, targetSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Middle circle
      ctx.beginPath();
      ctx.arc(centerX, centerY - 80, targetSize * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner circle (bullseye)
      ctx.fillStyle = `rgba(50, 205, 50, 0.6)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 80, targetSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Add text instruction
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎯 Look STRAIGHT', centerX, centerY + 120);
    }
    
    ctx.restore();
  };

  // Update onResults to include guide face and positioning checks
  const onResults = (results: any) => {
    const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
    setIsFaceDetected(hasFace);
    
    if (!hasFace) {
      // Only update prompt if verification is started
      if (started) {
        setPrompt('No face detected. Please position yourself in front of the camera.');
        updateCommentary('❌ No face detected! Please move into camera view');
      } else {
        updateCommentary('📷 Camera ready, waiting for face detection...');
      }
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    
    // Calculate face positioning metrics
    const faceDistanceVal = computeFaceDistance(landmarks);
    const faceCenterOffsetVal = computeFaceCenterOffset(landmarks, 640, 480);
    const positionCheck = isFaceWellPositioned(faceDistanceVal, faceCenterOffsetVal);
    
    setFaceDistance(faceDistanceVal);
    setFaceCenterOffset(faceCenterOffsetVal);

    // Position commentary - more encouraging and less strict
    if (startedRef.current) {
      if (positionCheck.isGood) {
        updateCommentary('🎯 Great positioning! Ready for verification');
      } else if (faceDistanceVal < 0.05) {
        updateCommentary('📷 Move a bit closer to the camera');
      } else if (faceDistanceVal > 0.75) {
        updateCommentary('📷 Move a bit away from the camera');
      } else if (faceCenterOffsetVal.x > 0.40 || faceCenterOffsetVal.y > 0.40) {
        updateCommentary('📷 Center your face in the frame');
      } else {
        updateCommentary('📷 Position looks good, continue with verification');
      }
    }
    
    // Draw mesh and guide
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && videoRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Draw guide face
      drawGuideFace(ctx, canvas.width, canvas.height);
      
      // Draw mesh with color based on positioning
      ctx.strokeStyle = positionCheck.isGood ? '#00FF00' : '#FF69B4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const pt of landmarks) {
        ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1, 0, 2 * Math.PI);
      }
      ctx.stroke();

      // Calculate lighting
      const lightingVal = computeLighting(ctx, canvas.width, canvas.height);
      setLighting(lightingVal);

      if (lightingVal < LIGHTING_THRESHOLD) {
        setLowLightingFrames((prev) => Math.min(prev + 1, LIGHTING_CONSECUTIVE_FRAMES));
      } else {
        setLowLightingFrames(0);
      }
    }

    // Compute yaw
    const yawVal = computeYaw(landmarks);
    setYaw(yawVal);
    console.log('Current step:', step, 'Yaw:', yawVal, 'Position:', positionCheck, 'Started:', startedRef.current);

    // Step logic with positioning validation - only when verification is started
    if (startedRef.current) {
      const currentStep = stepRef.current;
      console.log(`Step logic executing: currentStep=${currentStep}, yaw=${yawVal}, started=${started}`);
      
      if (currentStep === 0) {
        console.log(`Step 0: Checking if yaw (${yawVal}) < LEFT_THRESHOLD (${YAW_LEFT_THRESHOLD})`);
        
        // Live commentary for left turn (FIRST STEP)
        if (yawVal < YAW_LEFT_THRESHOLD) {
          console.log('✅ LEFT turn detected! Moving to step 1');
          updateCommentary('🎉 EXCELLENT! Left turn completed! Now turn RIGHT');
          updateStep(1);
          setPrompt(steps[1]);
          updateStepCompletion(0);
          playBeep();
        } else if (yawVal < -15) {
          updateCommentary(`🔄 Good! Keep turning left... (${Math.round(yawVal)}°)`);
        } else if (yawVal < -5) {
          updateCommentary(`⬅️ Start turning your head to the LEFT (${Math.round(yawVal)}°)`);
        } else {
          updateCommentary(`⬅️ Turn your head to the LEFT to continue (${Math.round(yawVal)}°)`);
        }
      } else if (currentStep === 1) {
        console.log(`Step 1: Checking if yaw (${yawVal}) > RIGHT_THRESHOLD (${YAW_RIGHT_THRESHOLD})`);
        
        // Live commentary for right turn (SECOND STEP)
        if (yawVal > YAW_RIGHT_THRESHOLD) {
          console.log('✅ RIGHT turn detected! Moving to step 2');
          updateCommentary('🎊 FANTASTIC! Right turn completed! Now look straight ahead');
          updateStep(2);
          setPrompt(steps[2]);
          updateStepCompletion(1);
          playBeep();
        } else if (yawVal > 15) {
          updateCommentary(`🔄 Excellent! Keep turning right... (${Math.round(yawVal)}°)`);
        } else if (yawVal > 5) {
          updateCommentary(`➡️ Good start! Turn your head more to the RIGHT (${Math.round(yawVal)}°)`);
        } else {
          updateCommentary(`➡️ Turn your head to the RIGHT now! (${Math.round(yawVal)}°)`);
        }
      } else if (currentStep === 2) {
        // Enhanced final step validation - Further relaxed tolerance for flickering
        // Initial check: 12° tolerance for starting hold timer (increased from 8°)
        // Skip position validation if analysis has already started
        // Much more forgiving - only check for extreme positioning issues
        const isExtremelyOutOfPosition = !positionCheck.isGood && (
          faceDistanceVal < 0.02 || // Only if face is extremely small
          faceDistanceVal > 0.85 || // Only if face is extremely large
          faceCenterOffsetVal.x > 0.50 || // Only if face is extremely off-center
          faceCenterOffsetVal.y > 0.50
        );
        
        if (!analysisStarted && (isExtremelyOutOfPosition || lowLightingFrames >= LIGHTING_CONSECUTIVE_FRAMES || Math.abs(yawVal) > 25)) {
          setPrompt(positionCheck.isGood ? (lowLightingFrames >= LIGHTING_CONSECUTIVE_FRAMES ? `Improve lighting (Current: ${lighting})` : 'Look straight ahead!') : positionCheck.message);
          updateCommentary(`⚠️ Position adjustment needed: ${positionCheck.isGood ? (lowLightingFrames >= LIGHTING_CONSECUTIVE_FRAMES ? `Improve lighting (Current: ${lighting})` : 'Look straight ahead!') : positionCheck.message}`);
          // Reset hold timer if user moves out of position
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          holdStartTimeRef.current = null;
          setIsHoldActive(false);
          setHasSpokenHoldStill(false);
          return;
        }
        
        // All conditions met, start or continue hold timer
        // More resilient to small movements - only reset if position is extremely bad
        if (!holdStartTimeRef.current) {
          holdStartTimeRef.current = Date.now();
          setIsHoldActive(true);
          setHasSpokenHoldStill(false);
        }
        const elapsed = Date.now() - holdStartTimeRef.current;
        
        // Only reset hold timer if position is extremely bad (not just slightly off)
        if (holdStartTimeRef.current && isExtremelyOutOfPosition) {
          holdStartTimeRef.current = null;
          setIsHoldActive(false);
          setHasSpokenHoldStill(false);
          return;
        }
        
        // Allow small movements during hold period - much more forgiving for flickering
        // Hold period check: 30° tolerance for completing analysis (very forgiving)
        const isAcceptablePosition = (positionCheck.isGood || faceDistanceVal >= 0.05) && 
          lowLightingFrames < LIGHTING_CONSECUTIVE_FRAMES && 
          Math.abs(yawVal) <= 30; // Very tolerant during hold for natural movement
        
        if (elapsed >= 2000 && !genderResult && !analyzing && !analysisStarted && isAcceptablePosition) {
          // Hold complete, proceed to analysis - prevent re-analysis
          setPrompt('Analyzing...');
          speakInstruction('Analyzing');
          setAnalyzing(true);
          setAnalysisStarted(true); // Mark analysis as started
          setIsHoldActive(false);
          setHasSpokenHoldStill(false);
          holdStartTimeRef.current = null;
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          // Freeze last frame and mesh
          if (canvas && ctx) {
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setLastFrame({ image, mesh: landmarks });
          }
          // Use actual ML model analysis with face-api
          if (canvas) {
            setAnalyzing(true); // Set loading state
            if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
              performGenderAnalysisInternal(canvas).then((result: { gender: string; confidence: number }) => {
                setGenderResult(result);
                updateCommentary(`🎊 VERIFICATION COMPLETE! Detected: ${result.gender} (${result.confidence}% confidence)`);
                setPrompt('Verification complete!');
                updateStepCompletion(2);
                setStarted(false);
                startedRef.current = false;
                setVerificationComplete(true);
                setAnalyzing(false);
                setShowContinueButton(true);
                if (cameraRef.current) {
                  cameraRef.current.stop();
                  console.log('📷 Camera stopped immediately after verification');
                }
              }).catch((error) => {
                setAnalyzing(false);
                setAnalysisStarted(false); // Reset analysis flag on error
                setPrompt(error.message || 'Face analysis failed. Please try again.');
                updateCommentary('❌ Face analysis failed. Please retry.');
              });
            } else {
              setAnalyzing(false);
              setAnalysisStarted(false); // Reset analysis flag on error
              setPrompt('Camera not ready for analysis. Please retry.');
              updateCommentary('❌ Camera not ready for analysis.');
            }
          }
        } else if (elapsed < 2000 && !hasSpokenHoldStill && elapsed > 1000) {
          // Only say "hold still" after 1 second of holding, and only once
          setPrompt('Hold still');
          speakInstruction('Hold still');
          setHasSpokenHoldStill(true);
        }
      }
    }
  };

  // Start/Stop logic
  const startVerification = () => {
    console.log('🚀 START VERIFICATION CLICKED!');
    setStarted(true);
    startedRef.current = true; // Update ref immediately
    updateStep(0);
    setPrompt(steps[0]);
    setYaw(0);
    setLighting(0);
    setCompletedSteps([false, false, false]);
    setGenderResult(null);
    setVerificationComplete(false);
    setLastFrame({ image: null, mesh: null });
    setHasPlayedAnalysisBeep(false); // Reset analysis beep flag
    setShowContinueButton(false); // Reset continue button
    setAnalysisStarted(false); // Reset analysis flag
    updateCommentary('🚀 VERIFICATION STARTED! Turn your head to the LEFT first');
    console.log('✅ Verification started, step set to 0, startedRef:', startedRef.current);
  };

  const stopVerification = () => {
    setStarted(false);
    startedRef.current = false; // Update ref immediately
    updateStep(0);
    setPrompt('Camera ready! Click "Start Verification" to begin');
    setYaw(0);
    setLighting(0);
    setCompletedSteps([false, false, false]);
    setGenderResult(null);
    setVerificationComplete(false);
    setLastFrame({ image: null, mesh: null });
    setHasPlayedAnalysisBeep(false); // Reset analysis beep flag
    setShowContinueButton(false); // Reset continue button
    setAnalysisStarted(false); // Reset analysis flag
    updateCommentary('⏹️ Verification stopped by user');
    // Don't stop the camera, just reset the verification state
  };

  const continueAfterVerification = () => {
    if (genderResult) {
      const result = { 
        success: true, 
        gender: genderResult.gender,
        confidence: genderResult.confidence / 100,
        faceDistance: faceDistance,
        centerOffset: faceCenterOffset
      };
      
      // Use onVerificationComplete if provided, otherwise fall back to onNext
      if (onVerificationComplete) {
        onVerificationComplete(result);
      } else if (onNext) {
        onNext(result);
      }
    }
  };

  // Initialize camera and models
  useEffect(() => {
    let modelsLoaded = false;
    
    // Fallback to clear loading state after maximum time
    const fallbackTimer = setTimeout(() => {
      console.warn('Initialization taking too long, clearing loading state');
      setIsInitializing(false);
      setInitializationError('Initialization timeout. Please refresh the page.');
    }, 10000); // 10 second timeout
    
    const initializeVerification = async () => {
      try {
        setIsInitializing(true);
        setInitializationError(null);

        if (typeof window === 'undefined') return;
        
        // Initialize face-api models only once
        if (!modelsLoaded) {
          console.log('Loading face-api models...');
          try {
            const { initializeFaceAPI } = await import('@/lib/face-analysis');
            await initializeFaceAPI();
            console.log('Face-API models loaded successfully');
            modelsLoaded = true;
          } catch (modelError) {
            console.warn('Face-API models failed to load, will use fallback analysis:', modelError);
          }
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
          console.warn('Video or canvas ref not available, waiting...');
          // Don't create infinite retry - let the component render first
          setTimeout(() => {
            if (!video || !canvas) {
              setInitializationError('Unable to access camera elements. Please refresh the page.');
              setIsInitializing(false);
            } else {
              initializeVerification();
            }
          }, 2000);
          return;
        }

        // Set responsive dimensions based on screen size
        const isMobile = window.innerWidth < 640;
        const width = isMobile ? 320 : 480;
        const height = isMobile ? 240 : 360;
        
        canvas.width = width;
        canvas.height = height;
        
        // Initialize FaceMesh with comprehensive error handling for WASM issues
        let faceMesh: any;
        try {
          // Add a longer delay to ensure WASM is fully ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Dynamically import MediaPipe if not already loaded
          if (!FaceMesh) {
            try {
              const { FaceMesh: FaceMeshModule } = await import('@mediapipe/face_mesh');
              FaceMesh = FaceMeshModule;
            } catch (importError) {
              console.error('Failed to import MediaPipe FaceMesh:', importError);
              throw new Error('MediaPipe FaceMesh not available');
            }
          }
          
          // Check if MediaPipe is available
          if (!FaceMesh) {
            throw new Error('MediaPipe FaceMesh not available');
          }
          
          faceMesh = new FaceMesh({
            locateFile: (file: string) => {
              // Try multiple CDN sources for better reliability
              const cdnUrls = [
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                `https://unpkg.com/@mediapipe/face_mesh/${file}`,
                `https://cdn.skypack.dev/@mediapipe/face_mesh/${file}`
              ];
              return cdnUrls[0]; // Start with primary CDN
            },
          });
          
          // Wait for FaceMesh to be ready
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('FaceMesh initialization timeout'));
            }, 10000);
            
            faceMesh.setOptions({
              maxNumFaces: 1,
              refineLandmarks: true,
              minDetectionConfidence: 0.3,
              minTrackingConfidence: 0.3,
            });
            
            faceMesh.onResults(onResults);
            faceMeshRef.current = faceMesh;
            
            // Test if FaceMesh is working
            setTimeout(() => {
              clearTimeout(timeout);
              resolve(null);
            }, 1000);
          });
          
        } catch (faceMeshError) {
          console.error('FaceMesh initialization failed:', faceMeshError);
          throw new Error('Face detection failed to load. Please try refreshing the page or use a different browser (Chrome/Firefox recommended).');
        }

        // Initialize Camera
        const camera = new Camera(video, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: video });
            }
          },
          width: isMobile ? 320 : 640,
          height: isMobile ? 240 : 480,
          facingMode: 'user'
        });
        
        cameraRef.current = camera;

        // Wait for camera to be ready
        await camera.start();
        
        console.log('Camera started successfully, initialization complete');
        
        // Clear the fallback timer since initialization succeeded
        clearTimeout(fallbackTimer);
        
        // Add a small delay to ensure everything is loaded
        setTimeout(() => {
          setIsInitializing(false);
          setStarted(false); // Don't auto-start, wait for user to click Start button
          console.log('Face verification component ready');
        }, 1500);

              } catch (error) {
          console.error('Failed to initialize verification:', error);
          clearTimeout(fallbackTimer);
          
          // Check if it's a WASM-related error
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('buffer') || errorMessage.includes('WASM') || errorMessage.includes('Module')) {
            setInitializationError('Face detection failed to load. Please refresh the page or try a different browser (Chrome/Firefox recommended). If the issue persists, try clearing your browser cache.');
          } else {
            setInitializationError('Failed to access camera or load models. Please check permissions and refresh the page.');
          }
          setIsInitializing(false);
        }
    };

    initializeVerification();

    return () => {
      clearTimeout(fallbackTimer);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []); // Run once on mount

  // After verification, freeze the last frame and mesh
  useEffect(() => {
    if (verificationComplete && lastFrame.image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.putImageData(lastFrame.image, 0, 0);
        // Redraw mesh
        if (lastFrame.mesh) {
          ctx.strokeStyle = '#FF69B4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (const pt of lastFrame.mesh) {
            ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1, 0, 2 * Math.PI);
          }
          ctx.stroke();
        }
      }
    }
  }, [verificationComplete, lastFrame]);

  // Keep stepRef in sync with step
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Add a handler to stop with confirmation
  const handleCloseWithConfirmation = () => {
    if (window.confirm('Are you sure you want to stop face verification?')) {
      setStarted(false);
      startedRef.current = false;
      setStep(0);
      stepRef.current = 0;
      setCompletedSteps([false, false, false]);
      setGenderResult(null);
      setVerificationComplete(false);
      setLastFrame({ image: null, mesh: null });
      setHasPlayedAnalysisBeep(false);
      setShowContinueButton(false);
      setAnalyzing(false);
      holdStartTimeRef.current = null;
      setIsHoldActive(false);
      setHasSpokenHoldStill(false);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      
      // Use onClose if provided, otherwise fall back to onNext
      if (onClose) {
        onClose();
      } else if (onNext) {
        onNext({ success: false, cancelled: true });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}>
      {/* Overlay for outside click */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={handleCloseWithConfirmation}
        style={{ zIndex: 49 }}
      />
      <div className="relative w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-4 space-y-6 border border-white/10 transition-all duration-500 hover:bg-white/10 z-50 max-h-[85vh] overflow-y-auto" style={{ margin: 'auto', transform: 'translateY(-2vh)' }}>
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white/100 text-2xl font-bold bg-transparent border-none cursor-pointer z-50"
          onClick={handleCloseWithConfirmation}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center text-white/90 mb-4">
          Face Verification
        </h2>

        {/* Video and Canvas Elements - Always present but conditionally visible */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-50/5 to-slate-100/5 rounded-2xl overflow-hidden shadow-lg border border-white/10 transition-all duration-500 hover:border-white/20">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-500 scale-x-[-1] ${isInitializing || initializationError ? 'opacity-0' : 'opacity-100'}`}
            playsInline
            autoPlay
            muted
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-500 scale-x-[-1] ${isInitializing || initializationError ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Loading Overlay */}
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50/5 to-slate-100/5">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-white/80 text-lg font-medium">Initializing Camera & Models...</p>
                <p className="text-white/60 text-sm">Please wait while we load the verification system</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {initializationError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-400 text-lg font-medium">Initialization Failed</p>
                <p className="text-red-300/80 text-sm max-w-md">{initializationError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    setInitializationError(null);
                    setIsInitializing(true);
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors ml-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success Results Overlay */}
          {verificationComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-sm p-4 overflow-y-auto"
            >
              <div className="flex flex-col items-center justify-center min-h-full max-w-md w-full">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center mb-4"
                >
                  <FaCheckCircle className="text-white text-3xl" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center mb-4"
                >
                  <h2 className="text-emerald-100 text-xl font-bold mb-1">
                    ✅ Verification Complete!
                  </h2>
                  <p className="text-emerald-200/80 text-xs">
                    Face verification successfully completed
                  </p>
                </motion.div>

                {genderResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-black/20 backdrop-blur-md rounded-lg p-3 mb-4 text-center w-full"
                  >
                    <h3 className="text-emerald-200 text-base font-semibold mb-2">Detection Results</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center">
                        <p className="text-emerald-300/80 font-medium">Gender</p>
                        <p className="text-white text-base font-bold capitalize">{genderResult.gender}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-300/80 font-medium">Confidence</p>
                        <p className="text-white text-base font-bold">{genderResult.confidence}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-300/80 font-medium">Face Distance</p>
                        <p className="text-white text-sm">{faceDistance.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-300/80 font-medium">Positioning</p>
                        <p className="text-white text-sm">✅ Optimal</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showContinueButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={continueAfterVerification}
                    className="bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold text-base transition-all duration-300 shadow-lg border border-emerald-400/50 w-full max-w-xs"
                  >
                    Continue →
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Live Commentary Panel - Current Status Only */}
              {!verificationComplete && currentCommentary && (
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-3 rounded-lg text-white/90 text-sm max-w-xs transition-all duration-500">
                  <div className="font-semibold text-emerald-400 mb-2">🎙️ Live Status</div>
                  <div className="bg-emerald-500/20 border border-emerald-400/30 rounded p-2 text-emerald-200 font-medium">
                    📢 {currentCommentary}
                  </div>
                </div>
              )}

          {/* Enhanced Debug Info Overlay */}
          {!verificationComplete && (
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md p-2 rounded-lg text-white/90 text-sm font-mono transition-all duration-500">
              <div>Face Detected: {isFaceDetected ? '✅' : '❌'}</div>
              <div>Yaw: {yaw.toFixed(1)}°</div>
              <div>Distance: {faceDistance.toFixed(3)}</div>
              <div>Center X: {faceCenterOffset.x.toFixed(3)}</div>
              <div>Center Y: {faceCenterOffset.y.toFixed(3)}</div>
              <div>Lighting: {lighting.toFixed(0)}</div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Steps Progress - Show only when not initializing */}
        {!isInitializing && !initializationError && (
        <div className="grid grid-cols-3 gap-3">
          {steps.map((stepText, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5, ease: "easeOut" }}
              className={`flex flex-col items-center p-3 rounded-lg transition-all duration-500 ${
                completedSteps[index]
                  ? 'bg-emerald-500/10 border border-emerald-200/20 hover:bg-emerald-500/20'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex-shrink-0 mb-2">
                {completedSteps[index] ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-10 h-10 rounded-full bg-emerald-500/80 backdrop-blur-sm flex items-center justify-center shadow-md"
                  >
                    <FaCheckCircle className="text-white text-xl" />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-500/10 backdrop-blur-sm flex items-center justify-center shadow-md">
                    <FaTimesCircle className="text-slate-300/80 text-xl" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className={`font-medium text-xs transition-colors duration-500 ${
                  completedSteps[index] ? 'text-emerald-300/90' : 'text-white/70'
                }`}>
                  {stepText}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Status and Controls - Show only when not initializing */}
        {!isInitializing && !initializationError && (
        <div className="text-center space-y-3">
          {!verificationComplete && (
            <p className="text-base font-medium text-white/80 transition-all duration-500">
              {prompt}
            </p>
          )}
          {analyzing && !verificationComplete && (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-500/80 border-t-transparent mb-2"></div>
              <div className="text-slate-300/90 font-medium">Analyzing...</div>
              <div className="text-slate-400/70 text-xs mt-1">Please wait, do not move</div>
            </div>
          )}
          <div className="flex justify-center space-x-3 mt-4">
            {!started && !verificationComplete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={startVerification}
                className="bg-emerald-500/20 text-emerald-300 px-6 py-2 rounded-lg font-medium hover:bg-emerald-500/30 transition-all duration-500 shadow-md text-sm backdrop-blur-sm border border-emerald-400/20"
              >
                Start Verification
              </motion.button>
            )}
            {started && !verificationComplete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={stopVerification}
                className="bg-red-500/20 text-red-300 px-6 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-500 shadow-md text-sm backdrop-blur-sm border border-red-400/20"
              >
                Stop Verification
              </motion.button>
            )}
          </div>
        </div>
        )}
        
        {/* Hidden audio element for beep sound */}
        <audio ref={audioRef} src="/beep.mp3" preload="auto" />
      </div>
    </div>
  );
};

export default FaceVerification; 