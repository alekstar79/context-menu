import { describe, it, expect } from 'vitest'
import { Matrix } from '@/core/matrix'

describe('Matrix', () => {
  it('should create identity matrix by default', () => {
    const m = new Matrix()

    expect(m.a).toBe(1)
    expect(m.b).toBe(0)
    expect(m.c).toBe(0)
    expect(m.d).toBe(1)
    expect(m.e).toBe(0)
    expect(m.f).toBe(0)
  })

  it('should translate correctly', () => {
    const m = new Matrix()

    m.translate(10, 20)
    expect(m.toString()).toBe('matrix(1,0,0,1,10,20)')
  })

  it('should scale correctly', () => {
    const m = new Matrix()

    m.scale(2, 3)
    expect(m.toString()).toBe('matrix(2,0,0,3,0,0)')
  })

  it('should scale around point', () => {
    const m = new Matrix()

    m.scale(2, 2, 10, 10)
    expect(m.toString()).toBe('matrix(2,0,0,2,-10,-10)')
  })

  it('should rotate correctly', () => {
    const m = new Matrix()

    m.rotate(90)
    expect(m.a).toBeCloseTo(0)
    expect(m.b).toBeCloseTo(1)
    expect(m.c).toBeCloseTo(-1)
    expect(m.d).toBeCloseTo(0)
    expect(m.e).toBe(0)
    expect(m.f).toBe(0)
  })

  it('should rotate around point', () => {
    const m = new Matrix()

    m.rotate(90, 10, 10)
    expect(m.toString()).toMatch(/matrix/)
  })

  it('should add matrices', () => {
    const m1 = new Matrix(1, 2, 3, 4, 5, 6)
    const m2 = new Matrix(7, 8, 9, 10, 11, 12)

    m1.add(m2)
    expect(m1.a).toBe(31) // 7*1 + 8*3
    expect(m1.b).toBe(46) // 7*2 + 8*4
    expect(m1.c).toBe(39) // 9*1 + 10*3
    expect(m1.d).toBe(58) // 9*2 + 10*4
    expect(m1.e).toBe(52) // 5 + 11*1 + 12*3
    expect(m1.f).toBe(76) // 6 + 11*2 + 12*4
  })

  it('should clone', () => {
    const m = new Matrix(1,2,3,4,5,6)
    const clone = m.clone()

    expect(clone).not.toBe(m)
    expect(clone.a).toBe(1)
    expect(clone.b).toBe(2)
    expect(clone.c).toBe(3)
    expect(clone.d).toBe(4)
    expect(clone.e).toBe(5)
    expect(clone.f).toBe(6)
  })
})
