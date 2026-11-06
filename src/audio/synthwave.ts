/**
 * AlphaFeed Procedural Synthwave Audio Engine
 * Pure Web Audio API - zero external assets or MP3 dependencies.
 */

class SynthwaveAudioEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isPlayingBgm: boolean = false;
  private bgmIntervalId: any = null;
  private currentTrack: number = 0; // 0: Neon Horizon, 1: Cyber Runner, 2: Midnight Drift
  private tempo: number = 120; // BPM
  private currentStep: number = 0;
  private isMuted: boolean = false;

  public tracks = [
    { id: 0, name: 'Neon Horizon', style: 'Outrun / Arp Drive', bpm: 124 },
    { id: 1, name: 'Cyber Runner', style: 'Electro Darksynth', bpm: 132 },
    { id: 2, name: 'Midnight Drift', style: 'Chillwave / Melodic', bpm: 108 }
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(bgmVol: number, sfxVol: number, muted: boolean = false) {
    this.isMuted = muted;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, now);
    }
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(bgmVol, now);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(sfxVol, now);
    }
  }

  public setTrack(trackIndex: number) {
    this.currentTrack = Math.max(0, Math.min(2, trackIndex));
    this.tempo = this.tracks[this.currentTrack].bpm;
    if (this.isPlayingBgm) {
      this.stopBGM();
      this.startBGM();
    }
  }

  public getCurrentTrack(): number {
    return this.currentTrack;
  }

  /**
   * Start Synthwave BGM Loop
   */
  public startBGM() {
    this.initContext();
    if (this.isPlayingBgm || !this.ctx) return;
    this.isPlayingBgm = true;
    this.currentStep = 0;

    const stepDuration = 60 / this.tempo / 4; // 16th notes
    this.scheduleNextStep(stepDuration);
  }

  public stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  private scheduleNextStep(stepDuration: number) {
    if (!this.isPlayingBgm || !this.ctx) return;

    this.playPatternStep(this.currentStep);
    this.currentStep = (this.currentStep + 1) % 32;

    this.bgmIntervalId = setTimeout(() => {
      this.scheduleNextStep(stepDuration);
    }, stepDuration * 1000);
  }

  /**
   * Plays a single 16th-note step of the procedural synthwave track
   */
  private playPatternStep(step: number) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;

    // Bassline chord progressions
    // Track 0 (Neon Horizon): Am -> F -> C -> G
    // Track 1 (Cyber Runner): Dm -> Bb -> Gm -> A
    // Track 2 (Midnight Drift): Em -> C -> D -> Bm

    let rootFreq = 110; // A2
    const bar = Math.floor(step / 8);

    if (this.currentTrack === 0) {
      // Am - F - C - G
      const roots = [110, 87.31, 130.81, 98.0]; // A2, F2, C3, G2
      rootFreq = roots[bar % 4];
    } else if (this.currentTrack === 1) {
      // Dm - Bb - Gm - A
      const roots = [73.42, 116.54, 98.0, 110.0]; // D2, Bb2, G2, A2
      rootFreq = roots[bar % 4];
    } else {
      // Em - C - D - Bm
      const roots = [82.41, 130.81, 146.83, 123.47]; // E2, C3, D3, B2
      rootFreq = roots[bar % 4];
    }

    // 1. Synth Bass (16th note rolling bass on almost every step)
    const isBassActive = step % 2 === 0 || (step % 4 === 3);
    if (isBassActive) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const bassOctave = (step % 4 === 2) ? 2 : 1;
      osc.frequency.setValueAtTime(rootFreq * (bassOctave === 2 ? 1.5 : 1), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    // 2. Synth Kick & Snare Drums
    if (step % 8 === 0) {
      // Kick drum
      this.playSynthKick(now);
    } else if (step % 8 === 4) {
      // Retro gated snare
      this.playSynthSnare(now);
    } else if (step % 2 === 0) {
      // Hi-hat
      this.playSynthHiHat(now);
    }

    // 3. Arpeggiated Lead Synth (every other 16th note)
    if (step % 2 === 1) {
      const arpNotes = [1, 1.25, 1.5, 1.75, 2.0, 2.25];
      const noteMultiplier = arpNotes[(step + bar) % arpNotes.length];
      const leadFreq = rootFreq * 3 * noteMultiplier;

      const leadOsc = this.ctx.createOscillator();
      const leadFilter = this.ctx.createBiquadFilter();
      const leadGain = this.ctx.createGain();

      leadOsc.type = this.currentTrack === 2 ? 'sine' : 'square';
      leadOsc.frequency.setValueAtTime(leadFreq, now);

      leadFilter.type = 'bandpass';
      leadFilter.frequency.setValueAtTime(1400, now);
      leadFilter.Q.setValueAtTime(3, now);

      leadGain.gain.setValueAtTime(0.12, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(this.bgmGain);

      leadOsc.start(now);
      leadOsc.stop(now + 0.2);
    }
  }

  private playSynthKick(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.1);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playSynthSnare(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playSynthHiHat(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  // ================= SFX =================

  /**
   * Letter collected sound
   */
  public playLetterEat(isTarget: boolean = false, comboIndex: number = 0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const basePitch = isTarget ? 523.25 : 392.0; // C5 or G4
    const semitones = Math.min(12, comboIndex);
    const targetFreq = basePitch * Math.pow(2, semitones / 12);

    osc.type = isTarget ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(targetFreq * 0.8, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

    gain.gain.setValueAtTime(isTarget ? 0.35 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Word completion fanfare
   */
  public playWordComplete() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    chords.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const startTime = now + i * 0.07;
      osc.frequency.setValueAtTime(freq, startTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  /**
   * Power-up pickup sound
   */
  public playPowerUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * Turbo dash boost sound
   */
  public playBoost() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Crash / Death sound
   */
  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  /**
   * UI Click blip
   */
  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Achievement unlocked chime
   */
  public playAchievement() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880]; // A C# E A
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }
}

export const audio = new SynthwaveAudioEngine();
