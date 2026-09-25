const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function postMultipart(url, fileName, content) {
  return new Promise((resolve, reject) => {
    const boundary = '---------------------------' + Date.now();
    const body = [
      '--' + boundary,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
      'Content-Type: text/plain',
      '',
      content,
      '--' + boundary + '--'
    ].join('\r\n');

    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('Testing local server & Subtitle Edit Online APIs...');
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '3456' },
    stdio: 'inherit'
  });

  await new Promise(r => setTimeout(r, 1000));

  try {
    // 1. Root route
    const rootRes = await checkUrl('http://127.0.0.1:3456/');
    if (rootRes.status !== 200 || !rootRes.body.includes('<app-root>')) {
      throw new Error(`Failed to load root: status ${rootRes.status}`);
    }
    console.log('✓ Root HTML loads correctly (HTTP 200)');

    // 2. SPA routing
    const routeRes = await checkUrl('http://127.0.0.1:3456/subtitleedit/online');
    if (routeRes.status !== 200 || !routeRes.body.includes('<app-root>')) {
      throw new Error(`Failed SPA route: status ${routeRes.status}`);
    }
    console.log('✓ SPA routing works for /subtitleedit/online (HTTP 200)');

    // 3. Main JS bundle
    const jsRes = await checkUrl('http://127.0.0.1:3456/main.43142f35a6216646.js');
    if (jsRes.status !== 200 || jsRes.body.length < 500000) {
      throw new Error(`Failed to load main.js: status ${jsRes.status}`);
    }
    console.log('✓ Main JavaScript bundle loaded (' + jsRes.body.length + ' bytes)');

    // 4. Stylesheets & Assets
    const cssRes = await checkUrl('http://127.0.0.1:3456/bootstrap-night.min.css');
    if (cssRes.status !== 200 || cssRes.body.length < 100000) {
      throw new Error(`Failed to load bootstrap css: status ${cssRes.status}`);
    }
    console.log('✓ Offline Bootstrap stylesheet loaded (' + cssRes.body.length + ' bytes)');

    const assetRes = await checkUrl('http://127.0.0.1:3456/assets/SubtitleEdit/Waveform1.png');
    if (assetRes.status !== 200) {
      throw new Error(`Failed to load asset: status ${assetRes.status}`);
    }
    console.log('✓ Waveform asset image loaded (HTTP 200)');

    // 5. SE-API: Subtitle Formats List
    const formatsRes = await checkUrl('http://127.0.0.1:3456/se-api/subtitle-formats/');
    if (formatsRes.status !== 200) {
      throw new Error(`Failed to load formats: status ${formatsRes.status}`);
    }
    const formats = JSON.parse(formatsRes.body);
    console.log(`✓ SE-API formats list available (${formats.length} formats supported)`);

    // 6. SE-API: Upload & Open Subtitle
    const uploadRes = await postMultipart(
      'http://127.0.0.1:3456/se-api/subtitles/',
      'demo.srt',
      '1\r\n00:00:01,000 --> 00:00:04,000\r\nHello World\r\n\r\n2\r\n00:00:05,000 --> 00:00:08,000\r\nSecond Line\r\n'
    );
    if (uploadRes.status !== 200) {
      throw new Error(`Failed to upload subtitle: status ${uploadRes.status}`);
    }
    const uploadJson = JSON.parse(uploadRes.body);
    if (!uploadJson.paragraphs || uploadJson.paragraphs.length !== 2) {
      throw new Error('Parsed paragraphs count incorrect: ' + uploadRes.body);
    }
    console.log(`✓ SE-API subtitle upload & parsing works (${uploadJson.paragraphs.length} paragraphs parsed)`);

    // 7. SE-API: Demo Waveform
    const waveformRes = await checkUrl('http://127.0.0.1:3456/se-api/demowaveform/');
    if (waveformRes.status !== 200) {
      throw new Error(`Failed to load demo waveform: status ${waveformRes.status}`);
    }
    console.log('✓ SE-API demo waveform data loaded (HTTP 200)');

    // 8. Headless Chrome DOM rendering
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(chromePath)) {
      console.log('Running browser render test with Chrome...');
      const domOutput = await new Promise((resolve, reject) => {
        const chrome = spawn(chromePath, ['--headless', '--dump-dom', 'http://127.0.0.1:3456/']);
        let out = '';
        chrome.stdout.on('data', d => out += d);
        chrome.on('close', code => {
          if (code === 0) resolve(out);
          else reject(new Error('Chrome exited with code ' + code));
        });
      });

      if (!domOutput.includes('app-subtitle-edit-online')) {
        throw new Error('Chrome did not render <app-subtitle-edit-online>');
      }
      console.log('✓ Angular Subtitle Edit Online app mounted and rendered in browser');
    }

    console.log('\nAll test checks passed successfully!');
  } finally {
    server.kill();
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
