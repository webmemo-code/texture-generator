/**
 * Color utility functions for texture generation
 */

/**
 * Convert hex color string to RGB object
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB object to hex color string
 */
export function rgbToHex(r, g, b) {
    const toHex = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Linear interpolation between two colors
 */
export function lerpColor(c1, c2, t) {
    return {
        r: c1.r + (c2.r - c1.r) * t,
        g: c1.g + (c2.g - c1.g) * t,
        b: c1.b + (c2.b - c1.b) * t
    };
}

/**
 * Convert HSL to hex color string
 */
export function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Get color from a 4-stop gradient based on value (0-1)
 * colors array: [color1 (bright), color2 (mid), color3 (dark), highlight]
 */
export function getGradientColor(value, colors, brightness = 1, contrast = 1) {
    // Apply contrast
    value = (value - 0.5) * contrast + 0.5;
    value = Math.max(0, Math.min(1, value));

    // Multi-stop gradient
    let c;
    if (value < 0.33) {
        c = lerpColor(colors[2], colors[1], value / 0.33);
    } else if (value < 0.66) {
        c = lerpColor(colors[1], colors[0], (value - 0.33) / 0.33);
    } else {
        c = lerpColor(colors[0], colors[3], (value - 0.66) / 0.34);
    }

    // Apply brightness
    return {
        r: Math.min(255, c.r * brightness),
        g: Math.min(255, c.g * brightness),
        b: Math.min(255, c.b * brightness)
    };
}

/**
 * Generate a random hex color
 */
export function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Blend two colors with an alpha value
 */
export function blendColors(c1, c2, alpha) {
    return {
        r: c1.r * (1 - alpha) + c2.r * alpha,
        g: c1.g * (1 - alpha) + c2.g * alpha,
        b: c1.b * (1 - alpha) + c2.b * alpha
    };
}
