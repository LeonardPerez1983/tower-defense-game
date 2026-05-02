/**
 * AudioSettings - Volume controls for master, SFX, and music
 *
 * Compact mobile-friendly layout with sliders and mute toggle
 */

import { useEffect, useState } from 'react';
import {
  getAudioSettings,
  setMasterVolume,
  setSfxVolume,
  setMusicVolume,
  setMuted,
  subscribeToAudioSettings,
  AudioSettings as AudioSettingsType,
} from '../../audio/audioSettingsStore';
import { playSfx } from '../../audio/soundManager';
import * as sfx from '../../audio/sfx';

export default function AudioSettings() {
  const [settings, setSettings] = useState<AudioSettingsType>(getAudioSettings());

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = subscribeToAudioSettings(setSettings);
    return unsubscribe;
  }, []);

  const handleMasterChange = (value: number) => {
    setMasterVolume(value);
    playSfx(sfx.ui_click, 0.5); // Preview sound at half volume
  };

  const handleSfxChange = (value: number) => {
    setSfxVolume(value);
    playSfx(sfx.card_play, 0.5);
  };

  const handleMusicChange = (value: number) => {
    setMusicVolume(value);
    // No preview for music (would interrupt any playing music)
  };

  const toggleMute = () => {
    setMuted(!settings.muted);
    if (settings.muted) {
      // Unmuting - play confirmation sound
      playSfx(sfx.ui_click, 0.5);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mute toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white">Mute All</span>
        <button
          onClick={toggleMute}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.muted ? 'bg-red-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.muted ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Master volume */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Master</span>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(settings.masterVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.masterVolume * 100}
          onChange={(e) => handleMasterChange(Number(e.target.value) / 100)}
          disabled={settings.muted}
          className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* SFX volume */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Sound Effects</span>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(settings.sfxVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.sfxVolume * 100}
          onChange={(e) => handleSfxChange(Number(e.target.value) / 100)}
          disabled={settings.muted}
          className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Music volume */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Music</span>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(settings.musicVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.musicVolume * 100}
          onChange={(e) => handleMusicChange(Number(e.target.value) / 100)}
          disabled={settings.muted}
          className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
