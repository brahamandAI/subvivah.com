module.exports = {
  apps: [
    {
      name: 'subvivah',
      script: './server.js',
      cwd: './',
      instances: 1,
      autorestart: false,
      stop_exit_code: [0],
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
}; 