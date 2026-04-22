const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8443;
const DIR = __dirname;
const CERT_DIR = path.join(DIR, '.certs');

// Generate self-signed cert if none exists
if (!fs.existsSync(path.join(CERT_DIR, 'key.pem'))) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
  console.log('Generating self-signed certificate...');
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${CERT_DIR}/key.pem" -out "${CERT_DIR}/cert.pem" ` +
    `-days 365 -nodes -subj "/CN=localhost"`,
    { stdio: 'inherit' }
  );
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
};

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(CERT_DIR, 'key.pem')),
    cert: fs.readFileSync(path.join(CERT_DIR, 'cert.pem')),
  },
  (req, res) => {
    let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
);

server.listen(PORT, () => {
  console.log(`\n  Game server running at https://localhost:${PORT}/index.html\n`);
  console.log('  IMPORTANT: Before sideloading to Teams, open the URL above in');
  console.log('  your browser and accept the self-signed certificate warning.\n');
  console.log('  Then sideload connect-game.zip in Teams:\n');
  console.log('  Teams > Apps > Manage your apps > Upload a custom app\n');
});
