// noinspection JSUnusedGlobalSymbols,JSSuspiciousNameCombination

import { rad } from './transform'

type MatrixLike = { a: number; b: number; c: number; d: number; e: number; f: number }

const defaultMatrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

/**
 * Represents a 2D transformation matrix (a, b, c, d, e, f) as used in SVG.
 */
export class Matrix {
  a!: number
  b!: number
  c!: number
  d!: number
  e!: number
  f!: number

  /**
   * Creates a new matrix.
   * If no arguments are given, creates an identity matrix.
   * If an object with a,b,c,d,e,f properties is provided (e.g., SVGMatrix), copies its values.
   */
  constructor(a?: number | MatrixLike, b?: number, c?: number, d?: number, e?: number, f?: number) {
    if (a instanceof SVGMatrix) {
      Object.assign(this, a)
      return
    }

    if (a != null) {
      Object.assign(this, { a: +a, b: +b!, c: +c!, d: +d!, e: +e!, f: +f! })
    } else {
      Object.assign(this, defaultMatrix)
    }
  }

  /**
   * Multiplies current matrix by another matrix.
   */
  add(a: number | Matrix, b?: number, c?: number, d?: number, e?: number, f?: number): this {
    if (a instanceof Matrix) {
      return this.add(a.a, a.b, a.c, a.d, a.e, a.f)
    }

    const aNew = (a as number) * this.a + (b as number) * this.c
    const bNew = (a as number) * this.b + (b as number) * this.d

    this.e += (e as number) * this.a + (f as number) * this.c
    this.f += (e as number) * this.b + (f as number) * this.d
    this.c = (c as number) * this.a + (d as number) * this.c
    this.d = (c as number) * this.b + (d as number) * this.d

    this.a = aNew
    this.b = bNew

    return this
  }

  /**
   * Returns inverse matrix.
   */
  invert(): Matrix {
    const det = this.a * this.d - this.b * this.c
    return new Matrix(
      this.d / det,
      -this.b / det,
      -this.c / det,
      this.a / det,
      (this.c * this.f - this.d * this.e) / det,
      (this.b * this.e - this.a * this.f) / det
    )
  }

  /**
   * Returns a copy of the matrix.
   */
  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f)
  }

  /**
   * Translates the matrix by x and y.
   */
  translate(x: number, y = 0): this {
    return this.add(1, 0, 0, 1, x, y)
  }

  /**
   * Scales the matrix by x and y, optionally about point (cx, cy).
   */
  scale(x: number, y: number = x, cx?: number, cy?: number): this {
    if (cx != null || cy != null) {
      this.translate(cx!, cy!)
    }

    this.a *= x
    this.b *= x
    this.c *= y
    this.d *= y

    if (cx != null || cy != null) {
      this.translate(-cx!, -cy!)
    }

    return this
  }

  /**
   * Rotates the matrix by angle (degrees) about point (x, y).
   */
  rotate(angle: number, x = 0, y = 0): this {
    angle = rad(angle)

    const cos = +Math.cos(angle).toFixed(9)
    const sin = +Math.sin(angle).toFixed(9)

    this.add(cos, sin, -sin, cos, x, y)

    return this.add(1, 0, 0, 1, -x, -y)
  }

  /**
   * Applies matrix to point (x, y) and returns resulting x.
   */
  x(x: number, y: number): number {
    return x * this.a + y * this.c + this.e
  }

  /**
   * Applies matrix to point (x, y) and returns resulting y.
   */
  y(x: number, y: number): number {
    return x * this.b + y * this.d + this.f
  }

  /**
   * Returns matrix as an SVG matrix string.
   */
  toString(): string {
    return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`
  }
}
