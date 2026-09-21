export interface WaveformData {
  min: Float32Array;
  max: Float32Array;
  samplesPerSecond: number;
  normalization: number;
}

const DEFAULT_SAMPLES_PER_SECOND = 400;

export function summarizeAudio(channels: readonly Float32Array[], sampleRate: number, samplesPerSecond = DEFAULT_SAMPLES_PER_SECOND): WaveformData {
  const length = channels[0]?.length ?? 0;
  const binCount = Math.max(1, Math.ceil(length / sampleRate * samplesPerSecond));
  const min = new Float32Array(binCount);
  const max = new Float32Array(binCount);
  const histogram = new Uint32Array(256);

  for (let bin = 0; bin < binCount; bin++) {
    const start = Math.floor(bin * sampleRate / samplesPerSecond);
    const end = Math.min(length, Math.max(start + 1, Math.floor((bin + 1) * sampleRate / samplesPerSecond)));
    let low = 0; let high = 0;
    for (const channel of channels) {
      for (let index = start; index < end; index++) {
        const sample = channel[index] ?? 0;
        if (sample < low) low = sample;
        if (sample > high) high = sample;
      }
    }
    min[bin] = low; max[bin] = high;
    histogram[Math.min(255, Math.floor(Math.max(Math.abs(low), Math.abs(high)) * 255))]++;
  }

  const percentileTarget = Math.max(1, Math.ceil(binCount * .98));
  let seen = 0; let percentileBin = 1;
  for (let index = 0; index < histogram.length; index++) {
    seen += histogram[index];
    if (seen >= percentileTarget) { percentileBin = index; break; }
  }

  return { min, max, samplesPerSecond, normalization: Math.max(.02, percentileBin / 255) };
}

export async function createWaveform(file: File, samplesPerSecond = DEFAULT_SAMPLES_PER_SECOND): Promise<WaveformData> {
  const context = new AudioContext();
  try {
    const audio = await context.decodeAudioData(await file.arrayBuffer());
    const channels = Array.from({ length: audio.numberOfChannels }, (_, index) => audio.getChannelData(index));
    return summarizeAudio(channels, audio.sampleRate, samplesPerSecond);
  } finally { await context.close(); }
}
