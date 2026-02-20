import { describe, it, expect } from 'vitest'
import { parseTransformString, svgTransform2string, transform2matrix, rad } from '@/core/transform'

describe('transform', () => {
  describe('rad', () => {
    it('converts degrees to radians', () => {
      expect(rad(180)).toBe(Math.PI)
      expect(rad(90)).toBe(Math.PI/2)
    })
  })

  describe('parseTransformString', () => {
    it('parses simple translate', () => {
      const result = parseTransformString('t10,20')

      expect(result).not.toBeNull()
      expect(result!.length).toBe(1)
      expect(result![0]).toEqual(['t',10,20])
    })

    it('parses rotate with point', () => {
      const result = parseTransformString('r45,100,200')

      expect(result).not.toBeNull()
      expect(result!.length).toBe(1)
      expect(result![0]).toEqual(['r',45,100,200])
    })

    it('parses multiple commands', () => {
      const result = parseTransformString('r0,150,150s0.5,0.5,150,150')

      expect(result).not.toBeNull()
      expect(result!.length).toBe(2)
      expect(result![0]).toEqual(['r',0,150,150])
      expect(result![1]).toEqual(['s',0.5,0.5,150,150])
    })

    it('handles spaces and commas', () => {
      const result = parseTransformString('t 10 , 20 s 2 , 2')

      expect(result).not.toBeNull()
      expect(result!.length).toBe(2)
      expect(result![0]).toEqual(['t',10,20])
      expect(result![1]).toEqual(['s',2,2])
    })
  })

  describe('svgTransform2string', () => {
    it('converts standard SVG transform', () => {
      const result = svgTransform2string('translate(10,20) rotate(45)')

      expect(result).toEqual([
        ['t',10,20],
        ['r',45,0,0]
      ])
    })

    it('handles skewX', () => {
      const result = svgTransform2string('skewX(30)')

      expect(result[0][0]).toBe('m')
      expect(result[0][1]).toBe(1)
      expect(result[0][2]).toBe(0)
      expect(result[0][3]).toBeCloseTo(Math.tan(rad(30)))
      expect(result[0][4]).toBe(1)
      expect(result[0][5]).toBe(0)
      expect(result[0][6]).toBe(0)
    })
  })

  describe('transform2matrix', () => {
    it('creates matrix from simple translate', () => {
      const m = transform2matrix('t10,20')
      expect(m.toString()).toBe('matrix(1,0,0,1,10,20)')
    })

    it('creates matrix from rotate around point', () => {
      const m = transform2matrix('r90,150,150')
      expect(m.a).toBeCloseTo(0)
      expect(m.b).toBeCloseTo(1)
      expect(m.c).toBeCloseTo(-1)
      expect(m.d).toBeCloseTo(0)
    })

    it('handles multiple commands', () => {
      const m = transform2matrix('r0,150,150s0.5,0.5,150,150')
      expect(m.toString()).not.toBe('matrix(1,0,0,1,0,0)')
    })
  })
})
