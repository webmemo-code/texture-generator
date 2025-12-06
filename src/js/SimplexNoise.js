/**
 * 4D Simplex Noise implementation for seamless texture generation
 * Uses torus mapping to create tileable patterns
 */
export class SimplexNoise {
    constructor(seed = Math.random() * 10000) {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = i;

        // Shuffle with seed using linear congruential generator
        let n = seed;
        for (let i = 255; i > 0; i--) {
            n = (n * 16807) % 2147483647;
            const j = n % (i + 1);
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }

        this.seed = seed;
    }

    // 4D gradient vectors
    static grad4 = [
        [0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],
        [0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],
        [1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],
        [-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],
        [1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],
        [-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],
        [1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],
        [-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]
    ];

    dot4(g, x, y, z, w) {
        return g[0]*x + g[1]*y + g[2]*z + g[3]*w;
    }

    /**
     * 4D simplex noise
     */
    noise4D(x, y, z, w) {
        const F4 = (Math.sqrt(5) - 1) / 4;
        const G4 = (5 - Math.sqrt(5)) / 20;

        const s = (x + y + z + w) * F4;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        const l = Math.floor(w + s);

        const t = (i + j + k + l) * G4;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const W0 = l - t;

        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;
        const w0 = w - W0;

        let rankx = 0, ranky = 0, rankz = 0, rankw = 0;
        if (x0 > y0) rankx++; else ranky++;
        if (x0 > z0) rankx++; else rankz++;
        if (x0 > w0) rankx++; else rankw++;
        if (y0 > z0) ranky++; else rankz++;
        if (y0 > w0) ranky++; else rankw++;
        if (z0 > w0) rankz++; else rankw++;

        const i1 = rankx >= 3 ? 1 : 0;
        const j1 = ranky >= 3 ? 1 : 0;
        const k1 = rankz >= 3 ? 1 : 0;
        const l1 = rankw >= 3 ? 1 : 0;

        const i2 = rankx >= 2 ? 1 : 0;
        const j2 = ranky >= 2 ? 1 : 0;
        const k2 = rankz >= 2 ? 1 : 0;
        const l2 = rankw >= 2 ? 1 : 0;

        const i3 = rankx >= 1 ? 1 : 0;
        const j3 = ranky >= 1 ? 1 : 0;
        const k3 = rankz >= 1 ? 1 : 0;
        const l3 = rankw >= 1 ? 1 : 0;

        const x1 = x0 - i1 + G4;
        const y1 = y0 - j1 + G4;
        const z1 = z0 - k1 + G4;
        const w1 = w0 - l1 + G4;

        const x2 = x0 - i2 + 2*G4;
        const y2 = y0 - j2 + 2*G4;
        const z2 = z0 - k2 + 2*G4;
        const w2 = w0 - l2 + 2*G4;

        const x3 = x0 - i3 + 3*G4;
        const y3 = y0 - j3 + 3*G4;
        const z3 = z0 - k3 + 3*G4;
        const w3 = w0 - l3 + 3*G4;

        const x4 = x0 - 1 + 4*G4;
        const y4 = y0 - 1 + 4*G4;
        const z4 = z0 - 1 + 4*G4;
        const w4 = w0 - 1 + 4*G4;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const ll = l & 255;

        let n0, n1, n2, n3, n4;

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0;
        if (t0 < 0) n0 = 0;
        else {
            t0 *= t0;
            const gi0 = this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] % 32;
            n0 = t0 * t0 * this.dot4(SimplexNoise.grad4[gi0], x0, y0, z0, w0);
        }

        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1;
        if (t1 < 0) n1 = 0;
        else {
            t1 *= t1;
            const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32;
            n1 = t1 * t1 * this.dot4(SimplexNoise.grad4[gi1], x1, y1, z1, w1);
        }

        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2;
        if (t2 < 0) n2 = 0;
        else {
            t2 *= t2;
            const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32;
            n2 = t2 * t2 * this.dot4(SimplexNoise.grad4[gi2], x2, y2, z2, w2);
        }

        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3;
        if (t3 < 0) n3 = 0;
        else {
            t3 *= t3;
            const gi3 = this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32;
            n3 = t3 * t3 * this.dot4(SimplexNoise.grad4[gi3], x3, y3, z3, w3);
        }

        let t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4;
        if (t4 < 0) n4 = 0;
        else {
            t4 *= t4;
            const gi4 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32;
            n4 = t4 * t4 * this.dot4(SimplexNoise.grad4[gi4], x4, y4, z4, w4);
        }

        return 27 * (n0 + n1 + n2 + n3 + n4);
    }

    /**
     * Seamless 2D noise using 4D torus mapping
     * Maps 2D coordinates onto a 4D torus surface for perfect tiling
     */
    seamless2D(x, y, scale = 1) {
        const nx = x * scale;
        const ny = y * scale;

        // Map 2D coordinates to 4D torus
        const s = nx * Math.PI * 2;
        const t = ny * Math.PI * 2;

        const nx1 = Math.cos(s);
        const ny1 = Math.sin(s);
        const nx2 = Math.cos(t);
        const ny2 = Math.sin(t);

        return this.noise4D(nx1, ny1, nx2, ny2);
    }

    /**
     * Fractal Brownian Motion - multiple octaves of noise
     */
    fbm(x, y, octaves = 4, scale = 1, persistence = 0.5, lacunarity = 2) {
        let total = 0;
        let amplitude = 1;
        let frequency = scale;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.seamless2D(x, y, frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    /**
     * Reseed the noise generator
     */
    reseed(seed = Math.random() * 10000) {
        this.seed = seed;
        for (let i = 0; i < 256; i++) this.p[i] = i;

        let n = seed;
        for (let i = 255; i > 0; i--) {
            n = (n * 16807) % 2147483647;
            const j = n % (i + 1);
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }
}
