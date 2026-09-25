const http = require('http');
const { spawn } = require('child_process');

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Testing local server...');
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '3456' },
    stdio: 'inherit'
  });

  // Give server 1 second to start
  await new Promise(r => setTimeout(r, 1000));

  try {
    // 1. Root route
    const rootRes = await checkUrl('http://127.0.0.1:3456/');
    if (rootRes.status !== 200 || !rootRes.body.includes('<app-root>')) {
      throw new Error(`Failed to load root: status ${rootRes.status}`);
    }
    console.log('✓ Root HTML loads correctly (HTTP 200)');

    // 2. SubtitleEdit route fallback
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

    // 4. Stylesheets
    const cssRes = await checkUrl('http://127.0.0.1:3456/bootstrap-night.min.css');
    if (cssRes.status !== 200 || cssRes.body.length < 100000) {
      throw new Error(`Failed to load bootstrap css: status ${cssRes.status}`);
    }
    console.log('✓ Offline Bootstrap stylesheet loaded (' + cssRes.body.length + ' bytes)');

    // 5. Assets
    const assetRes = await checkUrl('http://127.0.0.1:3456/assets/SubtitleEdit/Waveform1.png');
    if (assetRes.status !== 200) {
      throw new Error(`Failed to load asset: status ${assetRes.status}`);
    }
    console.log('✓ Asset images loaded properly (HTTP 200)');

    // 6. Headless Chrome DOM rendering
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const fs = require('fs');
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
