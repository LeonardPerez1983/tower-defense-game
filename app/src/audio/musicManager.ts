/**
 * musicManager - Background music player
 *
 * Loads and plays background music with volume control
 */

import { getAudioSettings, subscribeToAudioSettings } from './audioSettingsStore';

let audioElement: HTMLAudioElement | null = null;
let isInitialized = false;

/**
 * Initialize and start background music
 */
export function startBackgroundMusic(): void {
  if (isInitialized) return;

  try {
    // Create audio element
    audioElement = new Audio('/audio/Hangar_Bay_Seven.mp3');
    audioElement.loop = true;

    // Set initial volume
    updateMusicVolume();

    // Subscribe to volume changes
    subscribeToAudioSettings(updateMusicVolume);

    // Start playing
    audioElement.play().catch(err => {
      console.warn('Could not autoplay music (browser policy):', err);
      // Music will start on first user interaction
    });

    isInitialized = true;
    console.log('Background music initialized');
  } catch (e) {
    console.warn('Failed to initialize background music:', e);
  }
}

/**
 * Update music volume from settings
 */
function updateMusicVolume(): void {
  if (!audioElement) return;

  const settings = getAudioSettings();

  if (settings.muted) {
    audioElement.volume = 0;
  } else {
    // Combine master and music volume
    audioElement.volume = settings.masterVolume * settings.musicVolume;
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic(): void {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}

/**
 * Resume background music if paused
 */
export function resumeBackgroundMusic(): void {
  if (audioElement && audioElement.paused) {
    audioElement.play().catch(err => {
      console.warn('Could not resume music:', err);
    });
  }
}

/**
 * Pause background music
 */
export function pauseBackgroundMusic(): void {
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
  }
}
