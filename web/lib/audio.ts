export interface Mood {
  id: string;
  name: string;
  hint: string;
  chords: number[][]; // MIDI notes, one chord per bar
  wave: OscillatorType;
  cutoff: number; // low-pass Hz
  pulse: number; // beats per second for the rhythmic gate, 0 = sustained
  noise: number; // 0–1 texture level
}

export const MOODS: Mood[] = [
  { id: "golden", name: "Golden Hour", hint: "Warm, open major pads", chords: [[48, 55, 64, 71], [53, 57, 64, 72], [45, 52, 60, 67], [50, 57, 62, 69]], wave: "sawtooth", cutoff: 1400, pulse: 0, noise: 0.05 },
  { id: "night", name: "Night Drive", hint: "Minor pulse, synthwave", chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]], wave: "sawtooth", cutoff: 1100, pulse: 4, noise: 0.03 },
  { id: "tension", name: "Tension", hint: "Low drone, rising unease", chords: [[36, 43, 49], [36, 43, 50], [36, 42, 49], [36, 43, 51]], wave: "triangle", cutoff: 700, pulse: 0, noise: 0.25 },
  { id: "lofi", name: "Lo-fi Room", hint: "Soft chords, vinyl hiss", chords: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 48, 52, 55]], wave: "triangle", cutoff: 900, pulse: 0, noise: 0.18 },
];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** Renders the mood offline (faster than real time) and returns a stereo AudioBuffer. */
export async function renderMood(mood: Mood, seconds: number, sampleRate = 44100): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, 0);
  master.gain.linearRampToValueAtTime(0.5, Math.min(1.5, seconds / 4));
  master.gain.setValueAtTime(0.5, Math.max(0, seconds - 2));
  master.gain.linearRampToValueAtTime(0, seconds);
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(mood.cutoff * 0.6, 0);
  filter.frequency.linearRampToValueAtTime(mood.cutoff * 1.3, seconds);
  filter.Q.value = 0.7;

  let bus: AudioNode = filter;
  if (mood.pulse) {
    const gate = ctx.createGain();
    const beat = 1 / mood.pulse;
    for (let t = 0; t < seconds; t += beat) {
      gate.gain.setValueAtTime(1, t);
      gate.gain.exponentialRampToValueAtTime(0.25, t + beat * 0.9);
    }
    filter.connect(gate);
    bus = gate;
  }
  bus.connect(master);

  const bar = seconds / Math.max(1, Math.round(seconds / 4)); // ~4s per chord
  const bars = Math.round(seconds / bar);
  for (let b = 0; b < bars; b++) {
    const chord = mood.chords[b % mood.chords.length];
    const t0 = b * bar;
    chord.forEach((note, i) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = mood.wave;
        osc.frequency.value = hz(note);
        osc.detune.value = detune;
        const g = ctx.createGain();
        const peak = 0.07 / chord.length;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.8, bar / 3));
        g.gain.setValueAtTime(peak, t0 + bar - 0.4);
        g.gain.linearRampToValueAtTime(0, t0 + bar + 0.3);
        const pan = ctx.createStereoPanner();
        pan.pan.value = (i / Math.max(1, chord.length - 1) - 0.5) * 0.8 * Math.sign(detune);
        osc.connect(g).connect(pan).connect(filter);
        osc.start(t0);
        osc.stop(t0 + bar + 0.35);
      }
    });
  }

  if (mood.noise) {
    const len = Math.ceil(seconds * sampleRate);
    const buf = ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.0005 ? 4 : 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const g = ctx.createGain();
    g.gain.value = mood.noise * 0.12;
    src.connect(hp).connect(g).connect(master);
    src.start(0);
  }

  return ctx.startRendering();
}

/** 16-bit PCM WAV encoder. */
export function toWav(buffer: AudioBuffer): Blob {
  const ch = buffer.numberOfChannels;
  const n = buffer.length * ch * 2;
  const view = new DataView(new ArrayBuffer(44 + n));
  const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  view.setUint32(4, 36 + n, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, n, true);
  const chans = Array.from({ length: ch }, (_, i) => buffer.getChannelData(i));
  let o = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (const c of chans) {
      const s = Math.max(-1, Math.min(1, c[i]));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}
