/**
 * PostProcessor - Handles post-processing effects like smear and blur
 */

export const SmearType = {
    NONE: 'none',
    DIRECTIONAL: 'directional',
    RADIAL: 'radial',
    ZOOM: 'zoom',
    FLOW: 'flow'
};

export class PostProcessor {
    /**
     * Apply post-processing effects to the canvas
     */
    apply(ctx, size, params, noise = null) {
        const {
            smearType = SmearType.NONE,
            smearStrength = 0,
            smearAngle = 45,
            smearSamples = 8,
            smoothness = 0,
            flowScale = 4
        } = params;

        if (smearType === SmearType.NONE && smoothness === 0) return;

        // Get current image data
        let imageData = ctx.getImageData(0, 0, size, size);
        let data = imageData.data;

        // Apply gaussian smoothness first if needed
        if (smoothness > 0) {
            imageData = this.gaussianBlur(imageData, size, smoothness);
            data = imageData.data;
        }

        if (smearType === SmearType.NONE || smearStrength === 0) {
            ctx.putImageData(imageData, 0, 0);
            return;
        }

        // Create output buffer
        const output = new Uint8ClampedArray(data.length);
        const smearAngleRad = smearAngle * Math.PI / 180;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;

                for (let i = 0; i < smearSamples; i++) {
                    const t = (i / (smearSamples - 1)) - 0.5; // -0.5 to 0.5
                    const offset = t * smearStrength;

                    let sampleX, sampleY;

                    switch (smearType) {
                        case SmearType.DIRECTIONAL: {
                            sampleX = x + Math.cos(smearAngleRad) * offset;
                            sampleY = y + Math.sin(smearAngleRad) * offset;
                            break;
                        }
                        case SmearType.RADIAL: {
                            const cx = size / 2;
                            const cy = size / 2;
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const angle = Math.atan2(dy, dx);
                            sampleX = cx + Math.cos(angle) * (dist + offset);
                            sampleY = cy + Math.sin(angle) * (dist + offset);
                            break;
                        }
                        case SmearType.ZOOM: {
                            const cx = size / 2;
                            const cy = size / 2;
                            const scale = 1 + (offset / size);
                            sampleX = cx + (x - cx) * scale;
                            sampleY = cy + (y - cy) * scale;
                            break;
                        }
                        case SmearType.FLOW: {
                            if (noise) {
                                // Sample noise to get flow direction
                                const nx = x / size;
                                const ny = y / size;
                                const flowX = noise.seamless2D(nx, ny, flowScale);
                                const flowY = noise.seamless2D(nx + 3.7, ny + 2.8, flowScale);
                                const flowAngle = Math.atan2(flowY, flowX);
                                sampleX = x + Math.cos(flowAngle) * offset;
                                sampleY = y + Math.sin(flowAngle) * offset;
                            } else {
                                sampleX = x;
                                sampleY = y;
                            }
                            break;
                        }
                        default:
                            sampleX = x;
                            sampleY = y;
                    }

                    // Seamless wrap
                    sampleX = ((sampleX % size) + size) % size;
                    sampleY = ((sampleY % size) + size) % size;

                    // Bilinear interpolation for smooth sampling
                    const color = this.sampleBilinear(data, size, sampleX, sampleY);

                    // Weight by gaussian falloff for smoother blur
                    const weight = Math.exp(-t * t * 4);
                    totalR += color.r * weight;
                    totalG += color.g * weight;
                    totalB += color.b * weight;
                    totalWeight += weight;
                }

                const idx = (y * size + x) * 4;
                output[idx] = totalR / totalWeight;
                output[idx + 1] = totalG / totalWeight;
                output[idx + 2] = totalB / totalWeight;
                output[idx + 3] = 255;
            }
        }

        ctx.putImageData(new ImageData(output, size, size), 0, 0);
    }

    /**
     * Bilinear interpolation sampling
     */
    sampleBilinear(data, size, x, y) {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = (x0 + 1) % size;
        const y1 = (y0 + 1) % size;

        const fx = x - x0;
        const fy = y - y0;

        const idx00 = (y0 * size + x0) * 4;
        const idx10 = (y0 * size + x1) * 4;
        const idx01 = (y1 * size + x0) * 4;
        const idx11 = (y1 * size + x1) * 4;

        const r = (data[idx00] * (1-fx) + data[idx10] * fx) * (1-fy) +
                  (data[idx01] * (1-fx) + data[idx11] * fx) * fy;
        const g = (data[idx00+1] * (1-fx) + data[idx10+1] * fx) * (1-fy) +
                  (data[idx01+1] * (1-fx) + data[idx11+1] * fx) * fy;
        const b = (data[idx00+2] * (1-fx) + data[idx10+2] * fx) * (1-fy) +
                  (data[idx01+2] * (1-fx) + data[idx11+2] * fx) * fy;

        return { r, g, b };
    }

    /**
     * 2-pass separable Gaussian blur
     */
    gaussianBlur(imageData, size, radius) {
        const data = imageData.data;
        const output = new Uint8ClampedArray(data.length);

        // Create gaussian kernel
        const kernelSize = Math.ceil(radius * 3) * 2 + 1;
        const kernel = [];
        const sigma = radius;
        let kernelSum = 0;

        for (let i = 0; i < kernelSize; i++) {
            const x = i - Math.floor(kernelSize / 2);
            const g = Math.exp(-(x * x) / (2 * sigma * sigma));
            kernel.push(g);
            kernelSum += g;
        }

        // Normalize
        for (let i = 0; i < kernelSize; i++) {
            kernel[i] /= kernelSum;
        }

        const halfKernel = Math.floor(kernelSize / 2);

        // Horizontal pass
        const temp = new Uint8ClampedArray(data.length);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let r = 0, g = 0, b = 0;

                for (let k = 0; k < kernelSize; k++) {
                    const sx = ((x + k - halfKernel) % size + size) % size;
                    const idx = (y * size + sx) * 4;
                    r += data[idx] * kernel[k];
                    g += data[idx + 1] * kernel[k];
                    b += data[idx + 2] * kernel[k];
                }

                const idx = (y * size + x) * 4;
                temp[idx] = r;
                temp[idx + 1] = g;
                temp[idx + 2] = b;
                temp[idx + 3] = 255;
            }
        }

        // Vertical pass
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let r = 0, g = 0, b = 0;

                for (let k = 0; k < kernelSize; k++) {
                    const sy = ((y + k - halfKernel) % size + size) % size;
                    const idx = (sy * size + x) * 4;
                    r += temp[idx] * kernel[k];
                    g += temp[idx + 1] * kernel[k];
                    b += temp[idx + 2] * kernel[k];
                }

                const idx = (y * size + x) * 4;
                output[idx] = r;
                output[idx + 1] = g;
                output[idx + 2] = b;
                output[idx + 3] = 255;
            }
        }

        return new ImageData(output, size, size);
    }
}
