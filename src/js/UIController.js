/**
 * UIController - Manages the user interface and connects to the texture generator
 */
import { TextureGenerator, PatternType } from './TextureGenerator.js';
import { SmearType } from './PostProcessor.js';
import { GifExporter, AnimationType } from './GifExporter.js';
import { presets, getPresetNames, getPreset, getPresetDisplayName } from './Presets.js';
import { randomColor } from './ColorUtils.js';

export class UIController {
    constructor() {
        this.generator = new TextureGenerator();
        this.gifExporter = new GifExporter(this.generator);
        this.elements = {};
        this.initialized = false;
    }

    /**
     * Initialize the UI controller
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.generator.setCanvas(this.elements.mainCanvas);
        this.loadPreset('silk');
        this.initialized = true;
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            // Canvas
            mainCanvas: document.getElementById('mainCanvas'),
            tiledPreview: document.getElementById('tiledPreview'),

            // Pattern controls
            patternType: document.getElementById('patternType'),
            scale: document.getElementById('scale'),
            scaleVal: document.getElementById('scaleVal'),
            octaves: document.getElementById('octaves'),
            octavesVal: document.getElementById('octavesVal'),
            warp: document.getElementById('warp'),
            warpVal: document.getElementById('warpVal'),
            angle: document.getElementById('angle'),
            angleVal: document.getElementById('angleVal'),

            // Smear controls
            smearType: document.getElementById('smearType'),
            smearStrength: document.getElementById('smearStrength'),
            smearStrengthVal: document.getElementById('smearStrengthVal'),
            smearAngle: document.getElementById('smearAngle'),
            smearAngleVal: document.getElementById('smearAngleVal'),
            smearSamples: document.getElementById('smearSamples'),
            smearSamplesVal: document.getElementById('smearSamplesVal'),
            smoothness: document.getElementById('smoothness'),
            smoothnessVal: document.getElementById('smoothnessVal'),

            // Color controls
            color1: document.getElementById('color1'),
            color2: document.getElementById('color2'),
            color3: document.getElementById('color3'),
            colorHighlight: document.getElementById('colorHighlight'),
            brightness: document.getElementById('brightness'),
            brightnessVal: document.getElementById('brightnessVal'),
            contrast: document.getElementById('contrast'),
            contrastVal: document.getElementById('contrastVal'),

            // Output controls
            size: document.getElementById('size'),

            // GIF controls
            gifOptions: document.getElementById('gifOptions'),
            gifAnimType: document.getElementById('gifAnimType'),
            gifFrames: document.getElementById('gifFrames'),
            gifFramesVal: document.getElementById('gifFramesVal'),
            gifDuration: document.getElementById('gifDuration'),
            gifDurationVal: document.getElementById('gifDurationVal'),
            gifSize: document.getElementById('gifSize'),
            gifProgress: document.getElementById('gifProgress'),
            gifProgressBar: document.getElementById('gifProgressBar'),
            gifStatus: document.getElementById('gifStatus'),

            // Preset buttons container
            presetContainer: document.getElementById('presetContainer')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Auto-generate on input change
        document.querySelectorAll('input[type="range"], input[type="color"], select').forEach(el => {
            if (!el.id.startsWith('gif')) {
                el.addEventListener('input', () => this.generate());
            }
        });

        // GIF option listeners
        this.elements.gifFrames?.addEventListener('input', () => {
            this.elements.gifFramesVal.textContent = this.elements.gifFrames.value;
        });

        this.elements.gifDuration?.addEventListener('input', () => {
            this.elements.gifDurationVal.textContent = this.elements.gifDuration.value + 's';
        });
    }

    /**
     * Get current generation parameters
     */
    getParams() {
        return {
            size: parseInt(this.elements.size.value),
            patternType: this.elements.patternType.value,
            scale: parseFloat(this.elements.scale.value),
            octaves: parseInt(this.elements.octaves.value),
            warpStrength: parseFloat(this.elements.warp.value),
            angle: parseFloat(this.elements.angle.value),
            colors: [
                this.elements.color1.value,
                this.elements.color2.value,
                this.elements.color3.value,
                this.elements.colorHighlight.value
            ],
            brightness: parseFloat(this.elements.brightness.value),
            contrast: parseFloat(this.elements.contrast.value)
        };
    }

    /**
     * Get current post-processing parameters
     */
    getPostProcessParams() {
        return {
            smearType: this.elements.smearType.value,
            smearStrength: parseFloat(this.elements.smearStrength.value),
            smearAngle: parseFloat(this.elements.smearAngle.value),
            smearSamples: parseInt(this.elements.smearSamples.value),
            smoothness: parseFloat(this.elements.smoothness.value),
            flowScale: parseFloat(this.elements.scale.value)
        };
    }

    /**
     * Generate texture with current settings
     */
    generate() {
        const params = this.getParams();
        const postProcessParams = this.getPostProcessParams();

        this.generator.render(params, postProcessParams);
        this.updateTiledPreview();
        this.updateLabels();
    }

    /**
     * Update the tiled preview
     */
    updateTiledPreview() {
        if (this.elements.tiledPreview) {
            this.elements.tiledPreview.style.backgroundImage =
                `url(${this.generator.toDataURL()})`;
        }
    }

    /**
     * Update value labels
     */
    updateLabels() {
        this.elements.scaleVal.textContent = this.elements.scale.value;
        this.elements.octavesVal.textContent = this.elements.octaves.value;
        this.elements.warpVal.textContent = this.elements.warp.value;
        this.elements.angleVal.textContent = this.elements.angle.value + '\u00B0';
        this.elements.brightnessVal.textContent = this.elements.brightness.value;
        this.elements.contrastVal.textContent = this.elements.contrast.value;
        this.elements.smearStrengthVal.textContent = this.elements.smearStrength.value;
        this.elements.smearAngleVal.textContent = this.elements.smearAngle.value + '\u00B0';
        this.elements.smearSamplesVal.textContent = this.elements.smearSamples.value;
        this.elements.smoothnessVal.textContent = this.elements.smoothness.value;
    }

    /**
     * Randomize all parameters
     */
    randomize() {
        this.generator.reseed();

        this.elements.scale.value = 2 + Math.random() * 8;
        this.elements.octaves.value = Math.floor(2 + Math.random() * 5);
        this.elements.warp.value = Math.random() * 4;
        this.elements.angle.value = Math.random() * 360;

        this.elements.color1.value = randomColor();
        this.elements.color2.value = randomColor();
        this.elements.color3.value = randomColor();
        this.elements.colorHighlight.value = randomColor();

        const smearTypes = Object.values(SmearType);
        this.elements.smearType.value = smearTypes[Math.floor(Math.random() * smearTypes.length)];
        this.elements.smearStrength.value = Math.random() * 30;
        this.elements.smearAngle.value = Math.random() * 360;
        this.elements.smearSamples.value = Math.floor(8 + Math.random() * 16);
        this.elements.smoothness.value = Math.random() * 5;

        this.generate();
    }

    /**
     * Load a preset configuration
     */
    loadPreset(name) {
        const preset = getPreset(name);
        if (!preset) return;

        const { params, postProcess } = preset;

        // Set pattern params
        this.elements.patternType.value = params.patternType;
        this.elements.scale.value = params.scale;
        this.elements.octaves.value = params.octaves;
        this.elements.warp.value = params.warpStrength;
        this.elements.angle.value = params.angle;
        this.elements.color1.value = params.colors[0];
        this.elements.color2.value = params.colors[1];
        this.elements.color3.value = params.colors[2];
        this.elements.colorHighlight.value = params.colors[3];
        this.elements.brightness.value = params.brightness;
        this.elements.contrast.value = params.contrast;

        // Set post-process params
        this.elements.smearType.value = postProcess.smearType;
        this.elements.smearStrength.value = postProcess.smearStrength;
        this.elements.smearAngle.value = postProcess.smearAngle;
        this.elements.smearSamples.value = postProcess.smearSamples;
        this.elements.smoothness.value = postProcess.smoothness;

        this.generate();
    }

    /**
     * Download current texture as PNG
     */
    downloadPNG(filename = 'seamless-texture.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.generator.toDataURL('image/png');
        link.click();
    }

    /**
     * Show GIF options panel
     */
    showGifOptions() {
        this.elements.gifOptions.style.display = 'block';
    }

    /**
     * Hide GIF options panel
     */
    hideGifOptions() {
        this.elements.gifOptions.style.display = 'none';
        this.elements.gifProgress.style.display = 'none';
    }

    /**
     * Generate and download GIF
     */
    async generateGif() {
        const frames = parseInt(this.elements.gifFrames.value);
        const duration = parseFloat(this.elements.gifDuration.value) * 1000;
        const size = parseInt(this.elements.gifSize.value);
        const animationType = this.elements.gifAnimType.value;

        // Show progress
        this.elements.gifProgress.style.display = 'block';
        this.elements.gifProgressBar.style.width = '0%';
        this.elements.gifStatus.textContent = 'Initializing...';

        try {
            await this.gifExporter.generateAndDownload({
                frames,
                duration,
                size,
                animationType,
                baseParams: this.getParams(),
                postProcessParams: this.getPostProcessParams()
            }, (progress, status) => {
                this.elements.gifProgressBar.style.width = (progress * 100) + '%';
                this.elements.gifStatus.textContent = status;
            });

            this.elements.gifStatus.textContent = 'Complete!';
            this.elements.gifProgressBar.style.width = '100%';

            // Hide after delay
            setTimeout(() => {
                this.hideGifOptions();
                // Regenerate at original size
                this.generate();
            }, 1000);
        } catch (error) {
            this.elements.gifStatus.textContent = 'Error: ' + error.message;
            console.error('GIF generation error:', error);
        }
    }

    /**
     * Cancel ongoing GIF generation
     */
    cancelGif() {
        this.gifExporter.cancel();
        this.hideGifOptions();
    }
}

// Export singleton instance
export const ui = new UIController();
