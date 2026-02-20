export const mina = {
  linear: (n: number): number => n,

  easeinout: (n: number): number => {
    if (n === 1) return 1;
    if (n === 0) return 0;
    const q = 0.48 - n / 1.04;
    const Q = Math.sqrt(0.1734 + q * q);
    const x = Q - q;
    const X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1);
    const y = -Q - q;
    const Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1);
    const t = X + Y + 0.5;
    return (1 - t) * 3 * t * t + t * t * t;
  },

  elastic: (n: number): number => {
    if (n === 0 || n === 1) return n;
    return Math.pow(2, -10 * n) * Math.sin((n - 0.075) * (2 * Math.PI) / 0.3) + 1;
  }
};
