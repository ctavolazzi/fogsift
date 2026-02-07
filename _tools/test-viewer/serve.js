const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5065;
const ROOT = __dirname;
const REPORT_PATH = path.join(__dirname, '..', '..', 'tests', 'report.json');

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath;

  if (url.pathname === '/report.json') {
    filePath = REPORT_PATH;
  } else if (url.pathname === '/' || url.pathname === '/index.html') {
    filePath = path.join(ROOT, 'index.html');
  } else {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error reading file');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Captain FogLift's Quality Report: http://localhost:${PORT}`);
});
