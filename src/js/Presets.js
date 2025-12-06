/**
 * Preset configurations for common texture types
 */
import { PatternType } from './TextureGenerator.js';
import { SmearType } from './PostProcessor.js';

export const presets = {
    silk: {
        name: 'Silk Wave',
        params: {
            patternType: PatternType.WARP,
            scale: 4,
            octaves: 5,
            warpStrength: 2.5,
            angle: 35,
            colors: ['#00d4aa', '#006666', '#002222', '#66ffee'],
            brightness: 1.1,
            contrast: 1.2
        },
        postProcess: {
            smearType: SmearType.DIRECTIONAL,
            smearStrength: 15,
            smearAngle: 35,
            smearSamples: 12,
            smoothness: 1
        }
    },
    silkSmooth: {
        name: 'Silk Smooth',
        params: {
            patternType: PatternType.WARP,
            scale: 3,
            octaves: 4,
            warpStrength: 3,
            angle: 45,
            colors: ['#00d4aa', '#008877', '#003333', '#aaffee'],
            brightness: 1.0,
            contrast: 1.0
        },
        postProcess: {
            smearType: SmearType.FLOW,
            smearStrength: 30,
            smearAngle: 45,
            smearSamples: 24,
            smoothness: 2
        }
    },
    marble: {
        name: 'Marble',
        params: {
            patternType: PatternType.MARBLE,
            scale: 3,
            octaves: 6,
            warpStrength: 3,
            angle: 20,
            colors: ['#ffffff', '#888888', '#333333', '#ffffff'],
            brightness: 1.0,
            contrast: 1.3
        },
        postProcess: {
            smearType: SmearType.NONE,
            smearStrength: 0,
            smearAngle: 20,
            smearSamples: 8,
            smoothness: 0
        }
    },
    clouds: {
        name: 'Clouds',
        params: {
            patternType: PatternType.TURBULENCE,
            scale: 3,
            octaves: 6,
            warpStrength: 1,
            angle: 0,
            colors: ['#ffffff', '#88aaff', '#4466aa', '#ffffff'],
            brightness: 1.2,
            contrast: 0.8
        },
        postProcess: {
            smearType: SmearType.NONE,
            smearStrength: 0,
            smearAngle: 0,
            smearSamples: 8,
            smoothness: 2
        }
    },
    plasma: {
        name: 'Plasma',
        params: {
            patternType: PatternType.WARP,
            scale: 5,
            octaves: 4,
            warpStrength: 3,
            angle: 60,
            colors: ['#ff00ff', '#0066ff', '#000033', '#ffff00'],
            brightness: 1.0,
            contrast: 1.1
        },
        postProcess: {
            smearType: SmearType.FLOW,
            smearStrength: 20,
            smearAngle: 0,
            smearSamples: 16,
            smoothness: 0
        }
    },
    water: {
        name: 'Water',
        params: {
            patternType: PatternType.WAVES,
            scale: 4,
            octaves: 5,
            warpStrength: 2,
            angle: 0,
            colors: ['#00aaff', '#004488', '#001133', '#88ddff'],
            brightness: 1.0,
            contrast: 1.0
        },
        postProcess: {
            smearType: SmearType.DIRECTIONAL,
            smearStrength: 8,
            smearAngle: 0,
            smearSamples: 8,
            smoothness: 1
        }
    },
    fire: {
        name: 'Fire',
        params: {
            patternType: PatternType.RIDGED,
            scale: 4,
            octaves: 5,
            warpStrength: 2,
            angle: 90,
            colors: ['#ffaa00', '#ff4400', '#220000', '#ffff88'],
            brightness: 1.1,
            contrast: 1.2
        },
        postProcess: {
            smearType: SmearType.DIRECTIONAL,
            smearStrength: 25,
            smearAngle: 90,
            smearSamples: 16,
            smoothness: 0
        }
    },
    vortex: {
        name: 'Vortex',
        params: {
            patternType: PatternType.WARP,
            scale: 5,
            octaves: 5,
            warpStrength: 4,
            angle: 0,
            colors: ['#8844ff', '#4400aa', '#110033', '#ff44ff'],
            brightness: 1.0,
            contrast: 1.2
        },
        postProcess: {
            smearType: SmearType.RADIAL,
            smearStrength: 20,
            smearAngle: 0,
            smearSamples: 16,
            smoothness: 1
        }
    },
    lava: {
        name: 'Lava',
        params: {
            patternType: PatternType.TURBULENCE,
            scale: 3,
            octaves: 5,
            warpStrength: 2,
            angle: 0,
            colors: ['#ff6600', '#cc0000', '#330000', '#ffff00'],
            brightness: 1.2,
            contrast: 1.4
        },
        postProcess: {
            smearType: SmearType.FLOW,
            smearStrength: 15,
            smearAngle: 0,
            smearSamples: 12,
            smoothness: 1
        }
    },
    ocean: {
        name: 'Ocean',
        params: {
            patternType: PatternType.WAVES,
            scale: 6,
            octaves: 6,
            warpStrength: 1.5,
            angle: 15,
            colors: ['#0088cc', '#004477', '#001122', '#66ddff'],
            brightness: 1.0,
            contrast: 1.1
        },
        postProcess: {
            smearType: SmearType.DIRECTIONAL,
            smearStrength: 12,
            smearAngle: 15,
            smearSamples: 10,
            smoothness: 2
        }
    },
    galaxy: {
        name: 'Galaxy',
        params: {
            patternType: PatternType.WARP,
            scale: 4,
            octaves: 6,
            warpStrength: 3.5,
            angle: 0,
            colors: ['#6644ff', '#220066', '#000011', '#ff88ff'],
            brightness: 1.1,
            contrast: 1.3
        },
        postProcess: {
            smearType: SmearType.RADIAL,
            smearStrength: 25,
            smearAngle: 0,
            smearSamples: 20,
            smoothness: 1
        }
    },
    wood: {
        name: 'Wood Grain',
        params: {
            patternType: PatternType.MARBLE,
            scale: 2,
            octaves: 4,
            warpStrength: 1.5,
            angle: 0,
            colors: ['#d4a574', '#8b5a2b', '#3d2314', '#e8c89e'],
            brightness: 1.0,
            contrast: 1.1
        },
        postProcess: {
            smearType: SmearType.DIRECTIONAL,
            smearStrength: 8,
            smearAngle: 0,
            smearSamples: 8,
            smoothness: 0
        }
    }
};

/**
 * Get list of preset names
 */
export function getPresetNames() {
    return Object.keys(presets);
}

/**
 * Get a preset by name
 */
export function getPreset(name) {
    return presets[name] || null;
}

/**
 * Get preset display name
 */
export function getPresetDisplayName(name) {
    return presets[name]?.name || name;
}
