#!/bin/bash

echo "🚀 Downloading face-api models for face verification..."

# Create models directory if it doesn't exist
mkdir -p public/models

# Base URL for face-api models
BASE_URL="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.3/model"

echo "📥 Downloading TinyFaceDetector model..."
curl -L -o public/models/tiny_face_detector_model-weights_manifest.json "${BASE_URL}/tiny_face_detector_model-weights_manifest.json"
curl -L -o public/models/tiny_face_detector_model.bin "${BASE_URL}/tiny_face_detector_model.bin"

echo "📥 Downloading Age and Gender model..."
curl -L -o public/models/age_gender_model-weights_manifest.json "${BASE_URL}/age_gender_model-weights_manifest.json"
curl -L -o public/models/age_gender_model.bin "${BASE_URL}/age_gender_model.bin"

echo "📥 Downloading Face Landmarks model..."
curl -L -o public/models/face_landmark_68_model-weights_manifest.json "${BASE_URL}/face_landmark_68_model-weights_manifest.json"
curl -L -o public/models/face_landmark_68_model.bin "${BASE_URL}/face_landmark_68_model.bin"

echo "📥 Downloading Face Expression model..."
curl -L -o public/models/face_expression_model-weights_manifest.json "${BASE_URL}/face_expression_model-weights_manifest.json"
curl -L -o public/models/face_expression_model.bin "${BASE_URL}/face_expression_model.bin"

echo "📥 Downloading Face Recognition model..."
curl -L -o public/models/face_recognition_model-weights_manifest.json "${BASE_URL}/face_recognition_model-weights_manifest.json"
curl -L -o public/models/face_recognition_model.bin "${BASE_URL}/face_recognition_model.bin"

echo "✅ All models downloaded successfully!"
echo "📁 Models are stored in: public/models/"
echo ""
echo "🎯 Models downloaded:"
echo "  - TinyFaceDetector: Fast face detection"
echo "  - AgeGender: Age and gender prediction"
echo "  - FaceLandmarks: 68-point facial landmarks"
echo "  - FaceExpression: Emotion detection"
echo "  - FaceRecognition: Face embedding extraction"
echo ""
echo "🚀 You can now use face verification with ML-powered analysis!" 