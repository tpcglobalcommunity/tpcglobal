const { spawn } = require('child_process');
const path = require('path');

const baseUrl = process.argv[2] || 'http://localhost:5174';
const scriptPath = path.join(__dirname, 'check-routes.mjs');

const child = spawn('node', [scriptPath], {
  env: { ...process.env, BASE_URL: baseUrl },
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
