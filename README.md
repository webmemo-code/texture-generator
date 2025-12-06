# Seamless Texture Generator

[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/claude-code)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

A browser-based procedural texture generator that creates seamless, tileable textures with animated GIF export capabilities.

## Features

- **Seamless Tiling** - Uses 4D simplex noise mapped to a torus for perfectly tileable textures
- **Multiple Pattern Types** - Domain Warp, Marble, Turbulence, Ridged Noise, and Sine Waves
- **Post-Processing Effects** - Directional, Radial, Zoom, and Flow-based smear/blur effects
- **Animated GIF Export** - 5 animation types: Flow, Warp Pulse, Rotate, Color Cycle, Smear Sweep
- **Real-time Preview** - Live updates as you adjust parameters
- **12 Built-in Presets** - Silk, Marble, Clouds, Plasma, Water, Fire, Vortex, Lava, Ocean, Galaxy, Wood Grain

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

Alternatively, serve the directory with any static file server or use the VS Code Live Server extension.

## Project Structure

```
texture-generator/
├── index.html                    # Main entry point
├── package.json                  # Project configuration
├── src/
│   ├── css/
│   │   └── styles.css           # Stylesheet
│   └── js/
│       ├── index.js             # Module exports
│       ├── SimplexNoise.js      # 4D Simplex noise implementation
│       ├── TextureGenerator.js  # Core texture generation engine
│       ├── PostProcessor.js     # Smear/blur effects
│       ├── ColorUtils.js        # Color utility functions
│       ├── GifExporter.js       # Animated GIF generation
│       ├── Presets.js           # Texture preset configurations
│       └── UIController.js      # UI management
```

## Programmatic Usage

The texture generator can be used as a library:

```javascript
import { TextureGenerator, PatternType } from './src/js/index.js';

const generator = new TextureGenerator();

// Generate texture data
const imageData = generator.generate({
    size: 256,
    patternType: PatternType.WARP,
    scale: 4,
    octaves: 5,
    warpStrength: 2.5,
    angle: 45,
    colors: ['#00d4aa', '#006666', '#003333', '#66ffdd'],
    brightness: 1.1,
    contrast: 1.2
});

// Or render directly to a canvas
generator.setCanvas(document.getElementById('myCanvas'));
generator.render(params, postProcessParams);
```

### Generating GIFs Programmatically

```javascript
import { TextureGenerator, GifExporter, AnimationType } from './src/js/index.js';

const generator = new TextureGenerator();
const exporter = new GifExporter(generator);

const blob = await exporter.generate({
    frames: 30,
    duration: 2000,
    size: 128,
    animationType: AnimationType.FLOW,
    baseParams: { /* texture params */ },
    postProcessParams: { /* post-process params */ }
}, (progress, status) => {
    console.log(`${Math.round(progress * 100)}% - ${status}`);
});

// Download the GIF
GifExporter.downloadBlob(blob, 'my-texture.gif');
```

## Pattern Types

| Type | Description |
|------|-------------|
| `warp` | Domain warping for flowing silk-like textures |
| `marble` | Veined stone texture with turbulence |
| `turbulence` | Chaotic, organic patterns |
| `ridged` | Mountain-like ridged features |
| `waves` | Layered sine wave patterns |

## Smear/Blur Types

| Type | Description |
|------|-------------|
| `none` | No smear effect |
| `directional` | Linear motion blur along an angle |
| `radial` | Blur radiating from center |
| `zoom` | Blur toward/away from center |
| `flow` | Blur that follows the noise pattern |

## Animation Types (GIF)

| Type | Description |
|------|-------------|
| `flow` | Seamless panning across the texture |
| `warp` | Oscillating warp strength |
| `rotate` | Rotating flow angle |
| `color` | Cycling through hue spectrum |
| `smear` | Rotating smear angle |

## Technical Details

The generator uses **4D simplex noise sampled on a torus** to achieve seamless tiling. By mapping 2D coordinates to a 4D toroidal surface using polar coordinates, the resulting noise is continuous across tile boundaries.

GIF encoding is handled by [gif.js](https://github.com/jnordberg/gif.js) using web workers for non-blocking operation.

## License

MIT
