/**
 * soundManager - Core audio system using Web Audio API
 *
 * Lazy initialization (AudioContext after user interaction)
 * Volume control with safe gain envelopes
 * Procedural sound generation
 */

import { getAudioSettings, subscribeToAudioSettings } from './audioSettingsStore';

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let sfxGainNode: GainNode | null = null;
let musicGainNode: GainNode | null = null;

/**
 * Initialize AudioContext (call after user interaction)
 */
export function initAudio(): void {
  if (audioContext) return; // Already initialized

  try {
    audioContext = new AudioContext();

    // Create gain nodes for volume control
    masterGainNode = audioContext.createGain();
    sfxGainNode = audioContext.createGain();
    musicGainNode = audioContext.createGain();

    // Connect gain hierarchy: sfx/music → master → destination
    sfxGainNode.connect(masterGainNode);
    musicGainNode.connect(masterGainNode);
    masterGainNode.connect(audioContext.destination);

    // Apply initial volumes from settings
    updateVolumes();

    // Subscribe to volume changes
    subscribeToAudioSettings(updateVolumes);

    console.log('Audio system initialized');
  } catch (e) {
    console.warn('Failed to initialize audio:', e);
  }
}

/**
 * Update gain nodes from audio settings
 */
function updateVolumes(): void {
  if (!masterGainNode || !sfxGainNode || !musicGainNode) return;

  const settings = getAudioSettings();

  if (settings.muted) {
    masterGainNode.gain.value = 0;
  } else {
    masterGainNode.gain.value = settings.masterVolume;
    sfxGainNode.gain.value = settings.sfxVolume;
    musicGainNode.gain.value = settings.musicVolume;
  }
}

/**
 * Get AudioContext (initialize if needed)
 */
export function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    initAudio();
  }
  return audioContext;
}

/**
 * Get SFX gain node
 */
export function getSfxGainNode(): GainNode | null {
  return sfxGainNode;
}

/**
 * Get music gain node
 */
export function getMusicGainNode(): GainNode | null {
  return musicGainNode;
}

/**
 * Play a procedural sound effect
 *
 * @param recipe - Function that generates sound nodes
 * @param volume - Optional volume multiplier (0-1), default 1.0
 */
export function playSfx(
  recipe: (ctx: AudioContext, destination: AudioNode) => void,
  volume: number = 1.0
): void {
  const ctx = getAudioContext();
  if (!ctx || !sfxGainNode) return;

  const settings = getAudioSettings();
  if (settings.muted) return;

  try {
    // Create envelope gain for this specific sound
    const envelope = ctx.createGain();
    envelope.gain.value = volume;
    envelope.connect(sfxGainNode);

    // Run the recipe (creates oscillators, filters, etc.)
    recipe(ctx, envelope);
  } catch (e) {
    console.warn('Failed to play SFX:', e);
  }
}

/**
 * Resume AudioContext (needed for some browsers after page load)
 */
export function resumeAudio(): void {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}
