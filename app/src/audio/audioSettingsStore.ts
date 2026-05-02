/**
 * audioSettingsStore - Audio settings with localStorage persistence
 */

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
}

const STORAGE_KEY = 'star_royale_audio_settings';

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.525,
  sfxVolume: 0.675,
  musicVolume: 0.375,
  muted: false,
};

let currentSettings: AudioSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<(settings: AudioSettings) => void>();

// Load from localStorage on init
function loadSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load audio settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

// Save to localStorage
function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save audio settings:', e);
  }
}

// Initialize
currentSettings = loadSettings();

// Get current settings
export function getAudioSettings(): AudioSettings {
  return { ...currentSettings };
}

// Update settings (partial update)
export function setAudioSettings(partial: Partial<AudioSettings>): void {
  currentSettings = { ...currentSettings, ...partial };
  saveSettings(currentSettings);
  notifyListeners();
}

// Convenience setters
export function setMuted(muted: boolean): void {
  setAudioSettings({ muted });
}

export function setMasterVolume(volume: number): void {
  setAudioSettings({ masterVolume: Math.max(0, Math.min(1, volume)) });
}

export function setSfxVolume(volume: number): void {
  setAudioSettings({ sfxVolume: Math.max(0, Math.min(1, volume)) });
}

export function setMusicVolume(volume: number): void {
  setAudioSettings({ musicVolume: Math.max(0, Math.min(1, volume)) });
}

// Subscribe to settings changes
export function subscribeToAudioSettings(listener: (settings: AudioSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Notify all listeners
function notifyListeners(): void {
  listeners.forEach(listener => listener(currentSettings));
}
