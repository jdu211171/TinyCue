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

- **Full Subtitle Operations**:
  - Open subtitle files (`.srt`, `.vtt`, `.sub`, `.ass`, etc.) with built-in API parsing.
  - Save & convert across 330+ subtitle formats.
  - Export clean plain text (`Subtitle > Export plain text...`).
  - Auto-break and un-break line utilities.
- **Integrated Backend (`/se-api`)**:
  - The local server implements the required `se-api/subtitles` endpoints with offline parsing fallbacks for SRT/VTT and proxy support to Nikse's conversion engine for all 330 formats.
  - Cached offline format definitions (`subtitle-formats.json`) and waveform data (`demowaveform.json`).
- **Video & Audio Synchronization**:
  - Load local video files, seek, play/pause (`Alt+P`), synchronize timestamps, adjust reading speed (CPS).
  - HTTP 206 partial range streaming for smooth video scrubbing.
- **Waveform Timeline**:
  - Waveform display, draw selections, insert cues directly at playback position, and snap cues.
- **100% Offline Ready**:
  - All scripts, stylesheets (`bootstrap-night`), UI graphics, and format registries are bundled locally.

