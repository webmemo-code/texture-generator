/**
 * TextureGenerator - Core texture generation engine
 * Generates seamless procedural textures using various pattern algorithms
 */
import { SimplexNoise } from './SimplexNoise.js';
import { hexToRgb, getGradientColor } from './ColorUtils.js';
import { PostProcessor } from './PostProcessor.js';

export const PatternType = {
    WARP: 'warp',
    MARBLE: 'marble',
    TURBULENCE: 'turbulence',
    RIDGED: 'ridged',
    WAVES: 'waves'
};

export class TextureGenerator {
    constructor() {
        this.noise = new SimplexNoise();
        this.postProcessor = new PostProcessor();
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize with a canvas element
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Create an offscreen canvas for rendering
     */
    createOffscreenCanvas(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        return {
            canvas,
            ctx: canvas.getContext('2d')
        };
    }

    /**
     * Reseed the noise generator
     */
    reseed(seed) {
        this.noise.reseed(seed);
    }

    /**
     * Generate texture with given parameters
     * @param {Object} params - Generation parameters
     * @returns {ImageData} Generated texture data
     */
    generate(params) {
        const {
            size = 256,
            patternType = PatternType.WARP,
            scale = 4,
            octaves = 4,
            warpStrength = 2,
            angle = 45,
            colors = ['#00d4aa', '#006666', '#003333', '#66ffdd'],
            brightness = 1,
            contrast = 1,
            flowOffset = 0
        } = params;

        // Ensure canvas is sized correctly
        if (this.canvas) {
            this.canvas.width = size;
            this.canvas.height = size;
        }

        const ctx = this.ctx || this.createOffscreenCanvas(size).ctx;
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        // Parse colors
        const colorObjs = colors.map(c => typeof c === 'string' ? hexToRgb(c) : c);

        // Direction vector for flow
        const angleRad = angle * Math.PI / 180;
        const dx = Math.cos(angleRad);
        const dy = Math.sin(angleRad);

        // Flow offset for animation
        const offsetX = flowOffset * dx;
        const offsetY = flowOffset * dy;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Add flow offset for animation
                const nx = ((x / size + offsetX) % 1 + 1) % 1;
                const ny = ((y / size + offsetY) % 1 + 1) % 1;

                const value = this.computePatternValue(
                    nx, ny, patternType, scale, octaves, warpStrength, dx, dy
                );

                const color = getGradientColor(value, colorObjs, brightness, contrast);

                const idx = (y * size + x) * 4;
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }

        return imageData;
    }

    /**
     * Compute pattern value at a given point
     */
    computePatternValue(nx, ny, patternType, scale, octaves, warpStrength, dx, dy) {
        switch (patternType) {
            case PatternType.WARP:
                return this.warpPattern(nx, ny, scale, octaves, warpStrength, dx, dy);
            case PatternType.MARBLE:
                return this.marblePattern(nx, ny, scale, octaves, warpStrength, dx, dy);
            case PatternType.TURBULENCE:
                return this.turbulencePattern(nx, ny, scale, octaves);
            case PatternType.RIDGED:
                return this.ridgedPattern(nx, ny, scale, octaves);
            case PatternType.WAVES:
                return this.wavesPattern(nx, ny, scale, octaves, warpStrength, dx, dy);
            default:
                return (this.noise.fbm(nx, ny, octaves, scale) + 1) / 2;
        }
    }

    /**
     * Domain warp pattern - creates flowing silk-like textures
     */
    warpPattern(nx, ny, scale, octaves, warpStrength, dx, dy) {
        const warpX = this.noise.fbm(nx, ny, octaves, scale * 2);
        const warpY = this.noise.fbm(nx + 5.2, ny + 1.3, octaves, scale * 2);

        const warpedX = nx + warpX * warpStrength * 0.1;
        const warpedY = ny + warpY * warpStrength * 0.1;

        // Add directional flow
        const flow = (warpedX * dx + warpedY * dy) * scale;
        let value = this.noise.fbm(warpedX, warpedY, octaves, scale);
        value = (value + 1) / 2;
        value = value * 0.7 + Math.sin(flow * Math.PI * 2) * 0.15 + 0.15;
        return value;
    }

    /**
     * Marble pattern - creates veined stone textures
     */
    marblePattern(nx, ny, scale, octaves, warpStrength, dx, dy) {
        const turbulence = this.noise.fbm(nx, ny, octaves, scale * 2);
        const vein = Math.sin((nx * dx + ny * dy) * scale * 10 + turbulence * warpStrength * 2);
        let value = (vein + 1) / 2;
        value = Math.pow(value, 0.5);
        return value;
    }

    /**
     * Turbulence pattern - creates chaotic, organic textures
     */
    turbulencePattern(nx, ny, scale, octaves) {
        let total = 0;
        let amplitude = 1;
        let freq = scale;
        let maxVal = 0;

        for (let i = 0; i < octaves; i++) {
            total += Math.abs(this.noise.seamless2D(nx, ny, freq)) * amplitude;
            maxVal += amplitude;
            amplitude *= 0.5;
            freq *= 2;
        }
        return total / maxVal;
    }

    /**
     * Ridged pattern - creates mountain-like features
     */
    ridgedPattern(nx, ny, scale, octaves) {
        let total = 0;
        let amplitude = 1;
        let freq = scale;
        let maxVal = 0;

        for (let i = 0; i < octaves; i++) {
            let n = this.noise.seamless2D(nx, ny, freq);
            n = 1 - Math.abs(n);
            n = n * n;
            total += n * amplitude;
            maxVal += amplitude;
            amplitude *= 0.5;
            freq *= 2;
        }
        return total / maxVal;
    }

    /**
     * Waves pattern - creates layered wave textures
     */
    wavesPattern(nx, ny, scale, octaves, warpStrength, dx, dy) {
        const n1 = this.noise.fbm(nx, ny, octaves, scale);
        const wave1 = Math.sin((nx * dx + ny * dy) * scale * 8 + n1 * warpStrength);
        const wave2 = Math.sin((nx * dy - ny * dx) * scale * 4 + n1 * warpStrength * 0.5);
        return (wave1 * 0.6 + wave2 * 0.4 + 1) / 2;
    }

    /**
     * Generate and render to the attached canvas with post-processing
     */
    render(params, postProcessParams = {}) {
        if (!this.ctx) {
            throw new Error('No canvas attached. Call setCanvas() first.');
        }

        const imageData = this.generate(params);
        this.ctx.putImageData(imageData, 0, 0);

        // Apply post-processing
        if (postProcessParams.smearType !== 'none' || postProcessParams.smoothness > 0) {
            this.postProcessor.apply(this.ctx, params.size, postProcessParams, this.noise);
        }

        return this.canvas;
    }

    /**
     * Generate a frame for GIF animation (returns canvas)
     */
    generateFrame(params, postProcessParams = {}) {
        const { canvas, ctx } = this.createOffscreenCanvas(params.size);
        const imageData = this.generate(params);
        ctx.putImageData(imageData, 0, 0);

        // Apply post-processing
        if (postProcessParams.smearType !== 'none' || postProcessParams.smoothness > 0) {
            this.postProcessor.apply(ctx, params.size, postProcessParams, this.noise);
        }

        return canvas;
    }

    /**
     * Get the canvas as a data URL
     */
    toDataURL(type = 'image/png') {
        if (!this.canvas) {
            throw new Error('No canvas attached');
        }
        return this.canvas.toDataURL(type);
    }

    /**
     * Get the canvas as a Blob
     */
    toBlob(type = 'image/png', quality = 1) {
        return new Promise((resolve) => {
            if (!this.canvas) {
                throw new Error('No canvas attached');
            }
            this.canvas.toBlob(resolve, type, quality);
        });
    }
}
