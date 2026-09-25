# Subtitle Edit Online (Local Clone)

A fully functional, offline-capable local clone of [Subtitle Edit Online](https://www.nikse.dk/subtitleedit/online).

## Overview

This project mirrors the client-side Angular application from `nikse.dk/subtitleedit/online`, packaged with:
- The full interactive subtitle editing suite (cues, timeline, video player, waveform viewer).
- Subtitle format conversions (SRT, WebVTT, ASS/SSA, and more).
- Local asset files and dark-mode Bootstrap styling for complete offline support.
- A zero-dependency Node.js HTTP server supporting SPA route fallbacks and byte-range requests for smooth local video playback and scrubbing.

## Quick Start

### 1. Start the Local Server

```bash
npm start
```

Or run directly:

```bash
node server.js
```

Then open your browser at:
[http://localhost:3000/](http://localhost:3000/)

### 2. Run Verification Tests

```bash
npm test
```

## Features

- **Subtitle Operations**: Create new, open existing subtitle files, download in various formats, export plain text.
- **Video & Audio Sync**: Load local video files, seek, play/pause (`Alt+P`), synchronize timestamps, adjust reading speed (CPS).
- **Waveform Timeline**: Draw selections, insert cues directly on audio peaks, snap cues.
- **Translation & Formatting**: Built-in translation options and auto-break/un-break utilities.
- **Offline Ready**: All scripts, stylesheets (`bootstrap-night`), and UI graphics are bundled locally.
