export class AudioController {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static isMuted = false;

  static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  static toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }

  private static playTone(freq: number, type: OscillatorType, duration: number, vol = 1) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  static playLoad() {
    this.init();
    // High pitched short click
    this.playTone(800, 'square', 0.1, 0.5);
    setTimeout(() => this.playTone(1200, 'square', 0.1, 0.5), 50);
  }

  static playFire() {
    this.init();
    // Pew pew sound (frequency drop)
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  static playBlock() {
    this.init();
    // Low thud / shield hum
    this.playTone(150, 'sine', 0.4, 1);
  }

  static playHit() {
    this.init();
    // Noise/explosion-like
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  static playWin() {
    this.init();
    this.playTone(440, 'sine', 0.2);
    setTimeout(() => this.playTone(554, 'sine', 0.2), 200);
    setTimeout(() => this.playTone(659, 'sine', 0.4), 400);
  }

  static playLose() {
    this.init();
    this.playTone(300, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.3), 300);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.6), 600);
  }
}
