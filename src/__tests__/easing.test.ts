import { describe, it, expect } from 'vitest'
import { mina } from '@/core/easing'

describe('mina easing functions', () => {
  it('linear', () => {
    expect(mina.linear(0)).toBe(0)
    expect(mina.linear(0.5)).toBe(0.5)
    expect(mina.linear(1)).toBe(1)
  })

  it('easeinout', () => {
    expect(mina.easeinout(0)).toBe(0)
    expect(mina.easeinout(1)).toBe(1)
    expect(mina.easeinout(0.5)).toBeCloseTo(0.5, 1)
  })

  it('elastic', () => {
    expect(mina.elastic(0)).toBe(0)
    expect(mina.elastic(1)).toBe(1)
    expect(mina.elastic(0.5)).toBeGreaterThan(0.5)
  })
})
