/**
 * Effect Configuration Loader
 *
 * Singleton class that loads and caches effect system configuration from
 * /effect/config.json. Must be loaded before using any effects by calling
 * loadEffectConfig() in an async context (e.g., useAudioMusicSet.loadMusicSet).
 *
 * TODO: Consider extracting some of this functionality to utility classes if
 * loading other static json files are needed.
 */

import { EffectSystemConfig } from "./types";

/**
 * Singleton loader for effect system configuration
 */
class EffectConfigLoader {
  private static instance: EffectConfigLoader | null = null;
  private config: EffectSystemConfig | null = null;
  private loading: Promise<EffectSystemConfig> | null = null;

  private constructor() {}

  static getInstance(): EffectConfigLoader {
    if (!EffectConfigLoader.instance) {
      EffectConfigLoader.instance = new EffectConfigLoader();
    }
    return EffectConfigLoader.instance;
  }

  /**
   * Loads config asynchronously. Returns cached config if already loaded.
   * Multiple concurrent calls return the same promise.
   */
  async load(): Promise<EffectSystemConfig> {
    // Return cached config if available
    if (this.config) {
      return this.config;
    }

    // Return in-flight load promise if loading
    if (this.loading) {
      return this.loading;
    }

    // Start new load
    this.loading = this.loadInternal();

    try {
      this.config = await this.loading;
      return this.config;
    } finally {
      this.loading = null;
    }
  }

  private async loadInternal(): Promise<EffectSystemConfig> {
    const response = await fetch("/effect/config.json");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch effect config: ${response.statusText}`
      );
    }

    const config: EffectSystemConfig = await response.json();
    return config;
  }

  /**
   * Gets synchronously cached config. Throws if not loaded yet.
   * Call load() first in async contexts before using getSync().
   */
  getSync(): EffectSystemConfig {
    if (!this.config) {
      throw new Error(
        "Effect config not loaded. Call loadEffectConfig() before using effects."
      );
    }
    return this.config;
  }

  /**
   * Force reload config (useful for hot reload in development).
   * Call load() again after invalidating to refresh.
   */
  invalidate(): void {
    this.config = null;
    this.loading = null;
  }
}

// Singleton instance
export const effectConfigLoader = EffectConfigLoader.getInstance();

// Convenience exports
export const loadEffectConfig = () => effectConfigLoader.load();
export const getEffectConfigSync = () => effectConfigLoader.getSync();
export const invalidateEffectConfig = () => effectConfigLoader.invalidate();
