// Minimal zero-dependency static server for the 3D bedroom.
// Usage:  node server.js   →   open http://localhost:5180
// (Port 5180, not 5173, to avoid clashing with the portfolio's Vite dev server.)
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5180;
const ROOT = __dirname;
const TYPES = {
  '.html':'text/html; charset=utf-8',
  '.js'  :'text/javascript; charset=utf-8',
  '.css' :'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png' :'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  // prevent path traversal
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('404 Not Found'); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'});
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Master Bedroom 3D  →  http://localhost:${PORT}\n  (Ctrl+C to stop)\n`);
});
