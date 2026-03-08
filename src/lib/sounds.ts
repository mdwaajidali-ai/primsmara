const audioCtxRef = { current: null as AudioContext | null };

function getCtx(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

export function playFlipSound() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

export function playShimmerSound() {
  const ctx = getCtx();
  [1200, 1600, 2000].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  });
}

export function playFanfare() {
  const ctx = getCtx();
  const notes = [400, 500, 600, 800];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.08, start);
    gain.gain.linearRampToValueAtTime(0, start + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  });
}

export function playPopSound() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.03;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.03;
  source.connect(gain).connect(ctx.destination);
  source.start();
}
