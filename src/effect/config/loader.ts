/**
 * Effect Configuration Loader
 *
 * Singleton class that loads and caches effect system configuration from
 * /effect/config.json. Must be loaded before using any effects by calling
 * loadEffectConfig() in an async context (e.g., useAudioMusicSet.loadMusicSet).
 */

import type { EffectSystemConfig } from "./types";

/**
 * Singleton loader for effect system configuration
 *
 * TODO: Consider extracting some of this functionality to utility classes if
 * loading other static json files are needed.
 *
 * TODO: Consider if we should load the config after music set is selected
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
      throw new Error(`Failed to fetch effect config: ${response.statusText}`);
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
   * Check if config is loaded without throwing
   */
  isLoaded(): boolean {
    return this.config !== null;
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
export const isEffectConfigLoaded = () => effectConfigLoader.isLoaded();
export const invalidateEffectConfig = () => effectConfigLoader.invalidate();

/**
 * Initialize effect config during app startup.
 * Call this in app root before any effects are created.
 * Returns a promise that resolves when config is loaded.
 */
export async function initializeEffectConfig(): Promise<void> {
  try {
    await loadEffectConfig();
  } catch (error) {
    console.error("[EffectConfig] Failed to initialize:", error);
    throw error;
  }
}

/**
 * Get default params for a specific effect type.
 * Returns the base defaults from config (without intensity overrides or variants).
 */
export function getEffectDefaults<
  T extends keyof EffectSystemConfig["effects"]
>(effectType: T): EffectSystemConfig["effects"][T]["defaults"] {
  const config = getEffectConfigSync();
  return config.effects[effectType].defaults;
}

/**
 * Get params for a specific effect variant.
 * Returns defaults merged with variant params.
 */
export function getEffectVariant<T extends keyof EffectSystemConfig["effects"]>(
  effectType: T,
  variantName: string
): EffectSystemConfig["effects"][T]["defaults"] {
  const config = getEffectConfigSync();
  const effectConfig = config.effects[effectType];
  const variant = effectConfig.variants?.[variantName];

  if (!variant) {
    console.warn(
      `[EffectConfig] Variant "${variantName}" not found for effect "${
        effectType as string
      }", using defaults`
    );
    return effectConfig.defaults;
  }

  return {
    ...effectConfig.defaults,
    ...variant,
  } as EffectSystemConfig["effects"][T]["defaults"];
}
