const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = express();
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const upload = multer({ dest: 'uploads/' });

AWS.config.update({ region: 'us-west-2' });
const rekognition = new AWS.Rekognition();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  // Serve static files from the .next directory
  app.use('/_next', express.static(path.join(__dirname, '.next')));

  // Handle API routes
  app.use('/api', express.json());

  // Handle all other routes with Next.js
  app.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // Create HTTP server
  createServer(app).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 