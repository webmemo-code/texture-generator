/**
 * Main entry point - exports all modules for the texture generator
 */

// Core modules
export { SimplexNoise } from './SimplexNoise.js';
export { TextureGenerator, PatternType } from './TextureGenerator.js';
export { PostProcessor, SmearType } from './PostProcessor.js';
export { GifExporter, AnimationType } from './GifExporter.js';

// Utilities
export * from './ColorUtils.js';

// Presets
export { presets, getPreset, getPresetNames, getPresetDisplayName } from './Presets.js';

// UI Controller
export { UIController, ui } from './UIController.js';
