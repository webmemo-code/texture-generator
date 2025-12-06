/**
 * GifExporter - Handles animated GIF generation
 * Supports multiple animation types for seamless textures
 */
import { hslToHex } from './ColorUtils.js';

export const AnimationType = {
    FLOW: 'flow',
    WARP: 'warp',
    ROTATE: 'rotate',
    COLOR: 'color',
    SMEAR: 'smear'
};

export class GifExporter {
    constructor(textureGenerator) {
        this.generator = textureGenerator;
        this.gif = null;
        this.isGenerating = false;
    }

    /**
     * Generate an animated GIF
     * @param {Object} options - GIF options
     * @param {Function} onProgress - Progress callback (0-1)
     * @returns {Promise<Blob>} GIF blob
     */
    async generate(options, onProgress = () => {}) {
        const {
            frames = 30,
            duration = 2000,
            size = 128,
            animationType = AnimationType.FLOW,
            baseParams = {},
            postProcessParams = {},
            quality = 10,
            workerScript = './src/js/gif.worker.js'
        } = options;

        if (this.isGenerating) {
            throw new Error('GIF generation already in progress');
        }

        this.isGenerating = true;
        const delay = Math.round(duration / frames);

        // Store original params for animations that modify them
        const originalParams = { ...baseParams };
        const originalPostParams = { ...postProcessParams };

        return new Promise((resolve, reject) => {
            // Create GIF encoder
            this.gif = new GIF({
                workers: 2,
                quality,
                width: size,
                height: size,
                workerScript
            });

            const generateFrames = async () => {
                try {
                    for (let i = 0; i < frames; i++) {
                        const progress = i / frames;
                        const t = progress * Math.PI * 2; // Full cycle

                        onProgress(progress * 0.5, `Rendering frame ${i + 1} of ${frames}...`);

                        // Get animated parameters
                        const { params, postParams } = this.getAnimatedParams(
                            animationType,
                            progress,
                            t,
                            originalParams,
                            originalPostParams
                        );

                        // Generate frame
                        const frameCanvas = this.generator.generateFrame(
                            { ...params, size },
                            postParams
                        );

                        // Add frame to GIF
                        this.gif.addFrame(frameCanvas, { delay, copy: true });

                        // Allow UI to update
                        await new Promise(r => setTimeout(r, 10));
                    }

                    // Render GIF
                    onProgress(0.5, 'Encoding GIF...');

                    this.gif.on('progress', p => {
                        onProgress(0.5 + p * 0.5, 'Encoding GIF...');
                    });

                    this.gif.on('finished', blob => {
                        this.isGenerating = false;
                        this.gif = null;
                        resolve(blob);
                    });

                    this.gif.render();
                } catch (error) {
                    this.isGenerating = false;
                    this.gif = null;
                    reject(error);
                }
            };

            generateFrames();
        });
    }

    /**
     * Get animated parameters based on animation type
     */
    getAnimatedParams(animationType, progress, t, baseParams, basePostParams) {
        const params = { ...baseParams };
        const postParams = { ...basePostParams };

        switch (animationType) {
            case AnimationType.FLOW: {
                // Seamless flow/pan animation
                params.flowOffset = progress;
                break;
            }
            case AnimationType.WARP: {
                // Pulse the warp strength
                const warpBase = baseParams.warpStrength || 2;
                params.warpStrength = warpBase + Math.sin(t) * warpBase * 0.5;
                break;
            }
            case AnimationType.ROTATE: {
                // Rotate the flow angle
                const angleBase = baseParams.angle || 0;
                params.angle = (angleBase + progress * 360) % 360;
                break;
            }
            case AnimationType.COLOR: {
                // Cycle through hue
                const hueShift = progress * 360;
                params.colors = [
                    hslToHex(hueShift, 70, 55),
                    hslToHex(hueShift + 30, 60, 35),
                    hslToHex(hueShift + 60, 50, 15),
                    hslToHex(hueShift - 30, 80, 75)
                ];
                break;
            }
            case AnimationType.SMEAR: {
                // Sweep the smear angle
                const smearAngleBase = basePostParams.smearAngle || 0;
                postParams.smearAngle = (smearAngleBase + progress * 360) % 360;
                break;
            }
        }

        return { params, postParams };
    }

    /**
     * Cancel ongoing GIF generation
     */
    cancel() {
        if (this.gif && this.isGenerating) {
            this.gif.abort();
            this.isGenerating = false;
            this.gif = null;
        }
    }

    /**
     * Download a blob as a file
     */
    static downloadBlob(blob, filename = 'seamless-texture.gif') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Generate and download GIF in one step
     */
    async generateAndDownload(options, onProgress = () => {}) {
        const blob = await this.generate(options, onProgress);
        GifExporter.downloadBlob(blob, options.filename || 'seamless-texture.gif');
        return blob;
    }
}
