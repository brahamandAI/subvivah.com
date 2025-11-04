#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p public/models

# Download face-api.js models
cd public/models

# Download tiny face detector model
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-shard1

# Download age and gender model
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/age_gender_model-weights_manifest.json
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/age_gender_model-shard1

# Download face landmark model
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1

# Download face recognition model
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard1

# Download face expression model
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_expression_model-weights_manifest.json
wget https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_expression_model-shard1

cd ../.. 