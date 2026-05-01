/**
 * Game State Tests - Baseline functionality before queue system
 *
 * These tests verify core game mechanics work correctly.
 * Run after each phase to catch regressions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, createInitialState } from '../engine/GameState';

describe('GameState - Initial State', () => {
  let state: GameState;

  beforeEach(() => {
    const config = new Map([
      ['max_energy', '10'],
      ['energy_regen_rate', '0.5'],
      ['tower_health', '1000'],
      ['max_workers', '5'],
      ['energy_per_worker', '0.2'],
    ]);
    state = createInitialState(config);
  });

  it('should initialize with correct energy values', () => {
    expect(state.playerEnergy).toBe(10);
    expect(state.cpuEnergy).toBe(10);
    expect(state.maxEnergy).toBe(10);
  });

  it('should initialize with correct tower HP', () => {
    expect(state.playerTowerHP).toBe(1000);
    expect(state.cpuTowerHP).toBe(1000);
  });

  it('should initialize with zero workers', () => {
    expect(state.playerWorkerCount).toBe(0);
    expect(state.cpuWorkerCount).toBe(0);
  });

  it('should initialize empty production queues', () => {
    expect(state.playerProductionQueue).toEqual([]);
    expect(state.cpuProductionQueue).toEqual([]);
  });

  it('should initialize empty removed cards lists', () => {
    expect(state.playerRemovedCards).toEqual([]);
    expect(state.cpuRemovedCards).toEqual([]);
  });

  it('should initialize SCV build counts at zero', () => {
    expect(state.playerScvsBuilt).toBe(0);
    expect(state.cpuScvsBuilt).toBe(0);
  });

  it('should start in splash phase', () => {
    expect(state.phase).toBe('splash');
  });

  it('should initialize empty hands and decks', () => {
    expect(state.playerHand).toEqual([]);
    expect(state.cpuHand).toEqual([]);
    expect(state.playerDeck).toEqual([]);
    expect(state.cpuDeck).toEqual([]);
  });
});

describe('GameState - Config Parsing', () => {
  it('should parse config values as numbers', () => {
    const config = new Map([
      ['max_energy', '15'],
      ['energy_regen_rate', '1.5'],
      ['tower_health', '2000'],
      ['max_workers', '10'],
      ['energy_per_worker', '0.3'],
    ]);
    const state = createInitialState(config);

    expect(state.maxEnergy).toBe(15);
    expect(state.energyRegenRate).toBe(1.5);
    expect(state.towerMaxHP).toBe(2000);
    expect(state.maxWorkers).toBe(10);
    expect(state.energyPerWorker).toBe(0.3);
  });

  it('should handle missing config with defaults', () => {
    const config = new Map();
    const state = createInitialState(config);

    // Should not crash, should use defaults
    expect(state.maxEnergy).toBeDefined();
    expect(state.energyRegenRate).toBeDefined();
  });
});
