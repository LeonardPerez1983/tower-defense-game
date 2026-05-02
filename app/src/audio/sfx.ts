/**
 * sfx - Procedural sound effect recipes
 *
 * Each function creates a Web Audio graph for a specific sound.
 * All sounds use safe gain envelopes to prevent clipping.
 */

// ============================================================================
// UI SOUNDS
// ============================================================================

/**
 * UI Click - Sharp tap sound
 */
export function ui_click(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * UI Error - Low buzzer
 */
export function ui_error(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/**
 * Card Play - Whoosh effect
 */
export function card_play(ctx: AudioContext, destination: AudioNode): void {
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Create white noise buffer
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;

  // Sweep filter for whoosh
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  filter.Q.value = 3;

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 0.15);
}

/**
 * Energy Full - Bright chime
 */
export function energy_full(ctx: AudioContext, destination: AudioNode): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.value = 880; // A5
  osc2.type = 'sine';
  osc2.frequency.value = 1320; // E6 (perfect fifth above)

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.3);
  osc2.stop(ctx.currentTime + 0.3);
}

// ============================================================================
// BUILDING SOUNDS
// ============================================================================

/**
 * Building Place - Construction thud
 */
export function building_place(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

// ============================================================================
// UNIT SOUNDS
// ============================================================================

/**
 * Unit Spawn - Materialize effect
 */
export function unit_spawn(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/**
 * Marine Shot - Gauss rifle burst (Terran)
 */
export function marine_shot(ctx: AudioContext, destination: AudioNode): void {
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Create noise burst
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  noise.buffer = buffer;

  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 0.08);
}

/**
 * Firebat Flame - Whooshing fire sound (Terran)
 */
export function firebat_flame(ctx: AudioContext, destination: AudioNode): void {
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Create red noise (lower frequency emphasis)
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.8;
  }
  noise.buffer = buffer;

  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 1;

  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + 0.25);
}

/**
 * Zergling Slash - Quick organic attack (Zerg)
 */
export function zergling_slash(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(250, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * Hydralisk Spine - Spitting projectile (Zerg)
 */
export function hydralisk_spine(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Organic hiss component
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
  }
  noise.buffer = buffer;

  // Pitch component
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);

  filter.type = 'highpass';
  filter.frequency.value = 2000;

  gain.gain.setValueAtTime(0.28, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.connect(gain);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  noise.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
  noise.stop(ctx.currentTime + 0.12);
}

/**
 * Zealot Slash - Psi blade energy attack (Protoss)
 */
export function zealot_slash(ctx: AudioContext, destination: AudioNode): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(600, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(900, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.15);
}

/**
 * Dragoon Plasma - Phase disruptor shot (Protoss)
 */
export function dragoon_plasma(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.setValueAtTime(450, ctx.currentTime + 0.05);
  osc.frequency.setValueAtTime(520, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

// ============================================================================
// COMBAT SOUNDS
// ============================================================================

/**
 * Structure Hit - Building damage
 */
export function structure_hit(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/**
 * Shield Hit - Protoss shield impact
 */
export function shield_hit(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

// ============================================================================
// GAME STATE SOUNDS
// ============================================================================

/**
 * Victory - Ascending triumphant chord
 */
export function victory(ctx: AudioContext, destination: AudioNode): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();

  // C major chord: C-E-G
  osc1.type = 'sine';
  osc1.frequency.value = 523; // C5
  osc2.type = 'sine';
  osc2.frequency.value = 659; // E5
  osc3.type = 'sine';
  osc3.frequency.value = 784; // G5

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  gain.connect(destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc3.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1.0);
  osc2.stop(ctx.currentTime + 1.0);
  osc3.stop(ctx.currentTime + 1.0);
}

/**
 * Defeat - Descending minor chord
 */
export function defeat(ctx: AudioContext, destination: AudioNode): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();

  // C minor chord: C-Eb-G
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523, ctx.currentTime); // C5
  osc1.frequency.exponentialRampToValueAtTime(262, ctx.currentTime + 0.8); // C4

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(622, ctx.currentTime); // Eb5
  osc2.frequency.exponentialRampToValueAtTime(311, ctx.currentTime + 0.8); // Eb4

  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(784, ctx.currentTime); // G5
  osc3.frequency.exponentialRampToValueAtTime(392, ctx.currentTime + 0.8); // G4

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  gain.connect(destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc3.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1.2);
  osc2.stop(ctx.currentTime + 1.2);
  osc3.stop(ctx.currentTime + 1.2);
}
