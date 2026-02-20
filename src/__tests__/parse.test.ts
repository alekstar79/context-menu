import { describe, it, expect } from 'vitest'
import { parse } from '@/core/parse'

describe('parse', () => {
  it('should parse full SVG string', () => {
    const svgString = '<svg><g id="test"></g></svg>'
    const frag = parse(svgString)
    const g = frag.select('#test')
    expect(g).not.toBeNull()
  })

  it('should wrap fragment if not full SVG', () => {
    const svgString = '<g id="test"></g>'
    const frag = parse(svgString)
    const g = frag.select('#test')
    expect(g).not.toBeNull()
  })

  it('should handle empty string', () => {
    const frag = parse('')
    expect(frag.select('*')).toBeNull()
  })
})
