const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.srt': 'text/plain; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8'
};

// --- Offline Subtitle Parser & Generator Helpers ---

function parseTime(t) {
  if (!t) return 0;
  t = t.trim().replace(',', '.');
  const parts = t.split(':');
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) {
    h = parseFloat(parts[0]) || 0;
    m = parseFloat(parts[1]) || 0;
    s = parseFloat(parts[2]) || 0;
  } else if (parts.length === 2) {
    m = parseFloat(parts[0]) || 0;
    s = parseFloat(parts[1]) || 0;
  }
  return Math.round((h * 3600 + m * 60 + s) * 1000);
}

function parseSrtOrVtt(content, fileName = 'subtitles.srt') {
  content = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = content.split('\n');
  const paragraphs = [];
  let current = null;

  const timeRegex = /((\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3})\s*-->\s*((\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (current && current.text) {
        paragraphs.push(current);
        current = null;
      }
      continue;
    }

    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const start = parseTime(timeMatch[1]);
      const end = parseTime(timeMatch[3]);
      const num = current && typeof current.number === 'number' ? current.number : paragraphs.length + 1;
      current = { number: num, start, end, text: '' };
      continue;
    }

    if (!current && /^\d+$/.test(line)) {
      current = { number: parseInt(line, 10), start: 0, end: 0, text: '' };
      continue;
    }

    if (current) {
      current.text = current.text ? current.text + '\n' + line : line;
    }
  }

  if (current && current.text) {
    paragraphs.push(current);
  }

  return { paragraphs, fileName };
}

function extractFileFromMultipart(buffer) {
  const str = buffer.toString('binary');
  const filenameMatch = str.match(/filename="([^"]+)"/i);
  const fileName = filenameMatch ? filenameMatch[1] : 'subtitle.srt';

  // Find the double CRLF / double LF separating multipart headers from body
  let headerEnd = str.indexOf('\r\n\r\n');
  let bodyStart = headerEnd !== -1 ? headerEnd + 4 : str.indexOf('\n\n') + 2;

  if (headerEnd === -1) {
    return { fileName, content: buffer.toString('utf8') };
  }

  const boundaryMatch = str.match(/^--[^\r\n]+/);
  const boundary = boundaryMatch ? boundaryMatch[0] : '';
  let bodyEnd = str.lastIndexOf(boundary);
  if (bodyEnd > bodyStart) {
    // Strip trailing \r\n before boundary
    if (str.substring(bodyEnd - 2, bodyEnd) === '\r\n') bodyEnd -= 2;
  } else {
    bodyEnd = str.length;
  }

  const fileRaw = buffer.subarray(bodyStart, bodyEnd);
  return { fileName, content: fileRaw.toString('utf8') };
}

function formatTimeSrt(ms) {
  const totalSec = Math.floor(ms / 1000);
  const millis = ms % 1000;
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(millis, 3)}`;
}

function formatTimeVtt(ms) {
  const totalSec = Math.floor(ms / 1000);
  const millis = ms % 1000;
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(millis, 3)}`;
}

function exportSubtitlesLocal(paragraphs, formatName, useWindowsNewLine, origName = 'subtitles') {
  const nl = useWindowsNewLine ? '\r\n' : '\n';
  let content = '';
  let ext = '.srt';
  let mimeType = 'text/plain';

  const isVtt = formatName && formatName.toLowerCase().includes('vtt');
  if (isVtt) {
    ext = '.vtt';
    mimeType = 'text/vtt';
    content = 'WEBVTT' + nl + nl;
    (paragraphs || []).forEach((p, idx) => {
      content += `${idx + 1}${nl}${formatTimeVtt(p.start)} --> ${formatTimeVtt(p.end)}${nl}${p.text || ''}${nl}${nl}`;
    });
  } else {
    ext = '.srt';
    (paragraphs || []).forEach((p, idx) => {
      content += `${idx + 1}${nl}${formatTimeSrt(p.start)} --> ${formatTimeSrt(p.end)}${nl}${p.text || ''}${nl}${nl}`;
    });
  }

  const base = origName.replace(/\.[^/.]+$/, '');
  return {
    mimeType,
    fileName: `${base}${ext}`,
    buffer: Array.from(Buffer.from(content, 'utf8'))
  };
}

// Proxy helper with fallback
function proxyToNikse(req, res, reqBody, fallbackFn) {
  const headers = {
    ...req.headers,
    host: 'www.nikse.dk',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };
  delete headers['accept-encoding']; // Avoid gzip decompression complexities

  const proxyReq = https.request(`https://www.nikse.dk${req.url}`, {
    method: req.method,
    headers,
    timeout: 6000
  }, (proxyRes) => {
    if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    } else if (fallbackFn) {
      fallbackFn();
    } else {
      res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (fallbackFn) fallbackFn();
    else {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Gateway Timeout' }));
    }
  });

  proxyReq.on('error', () => {
    if (fallbackFn) fallbackFn();
    else {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error' }));
    }
  });

  if (reqBody && reqBody.length > 0) {
    proxyReq.write(reqBody);
  }
  proxyReq.end();
}

// --- Main HTTP Server ---

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // --- SE-API ENDPOINTS ---
  if (pathname.startsWith('/se-api/')) {
    // 1. Subtitle Formats List
    if (pathname === '/se-api/subtitle-formats/' || pathname === '/se-api/subtitle-formats') {
      const formatsPath = path.join(ROOT_DIR, 'subtitle-formats.json');
      if (fs.existsSync(formatsPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        fs.createReadStream(formatsPath).pipe(res);
        return;
      }
      proxyToNikse(req, res, null, null);
      return;
    }

    // 2. Demo Waveform
    if (pathname === '/se-api/demowaveform/' || pathname === '/se-api/demowaveform') {
      const waveformPath = path.join(ROOT_DIR, 'demowaveform.json');
      if (fs.existsSync(waveformPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        fs.createReadStream(waveformPath).pipe(res);
        return;
      }
      proxyToNikse(req, res, null, null);
      return;
    }

    // 3. Subtitle Upload (Open Subtitle File)
    if (pathname === '/se-api/subtitles/' || pathname === '/se-api/subtitles') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const fullBody = Buffer.concat(chunks);
        proxyToNikse(req, res, fullBody, () => {
          // Offline Fallback parser
          try {
            const { fileName, content } = extractFileFromMultipart(fullBody);
            const parsed = parseSrtOrVtt(content, fileName);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(parsed));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Failed to parse subtitle file' }));
          }
        });
      });
      return;
    }

    // 4. Download / Format Subtitle
    if (pathname.startsWith('/se-api/subtitles/format/')) {
      const formatName = pathname.replace('/se-api/subtitles/format/', '');
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const fullBody = Buffer.concat(chunks);
        proxyToNikse(req, res, fullBody, () => {
          // Offline Fallback export
          try {
            const data = JSON.parse(fullBody.toString('utf8'));
            const useWindowsNewLine = parsedUrl.searchParams.get('useWindowsNewLine') === 'true';
            const result = exportSubtitlesLocal(data.paragraphs, formatName, useWindowsNewLine, data.fileName);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
      return;
    }

    // 5. Download Plain Text
    if (pathname === '/se-api/subtitles/format-plain-text') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const fullBody = Buffer.concat(chunks);
        proxyToNikse(req, res, fullBody, () => {
          try {
            const data = JSON.parse(fullBody.toString('utf8'));
            const textLines = (data.paragraphs || []).map(p => p.text).filter(Boolean);
            const content = textLines.join('\n\n');
            const result = {
              mimeType: 'plain/text',
              fileName: 'subtitles.txt',
              buffer: Array.from(Buffer.from(content, 'utf8'))
            };
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
      return;
    }

    // Other se-api requests: proxy to nikse
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const fullBody = Buffer.concat(chunks);
      proxyToNikse(req, res, fullBody, null);
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let relativePath = pathname.replace(/^\/+/, '');
  let filePath = path.join(ROOT_DIR, relativePath);

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Fallback to index.html for SPA client-side routes (e.g. /subtitleedit/online)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;
    const range = req.headers.range;

    // Handle range requests for audio/video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize) {
        res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
        res.end();
        return;
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(` Subtitle Edit Online (Local Clone with SE-API)`);
  console.log(` Running at: http://localhost:${PORT}/`);
  console.log('----------------------------------------------------');
});
