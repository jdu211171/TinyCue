export async function createWaveform(file: File, bins = 4000): Promise<number[]> {
  const context = new AudioContext();
  try {
    const audio = await context.decodeAudioData(await file.arrayBuffer());
    const channel = audio.getChannelData(0); const block = Math.max(1, Math.floor(channel.length / bins)); const peaks: number[] = [];
    for (let offset = 0; offset < channel.length; offset += block) {
      let max = 0; const end = Math.min(channel.length, offset + block);
      for (let index = offset; index < end; index++) max = Math.max(max, Math.abs(channel[index]));
      peaks.push(max);
    }
    return peaks;
  } finally { await context.close(); }
}
