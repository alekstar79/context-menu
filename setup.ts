import { vi } from 'vitest'

declare global {
  interface SVGElement {
    getBBox(): DOMRect
  }
}

if (typeof SVGMatrix === 'undefined') {
  (globalThis as any).SVGMatrix = class SVGMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  }
}

globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  cb(0)
  return 0
}

globalThis.cancelAnimationFrame = () => {}

if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getBBox = function() {
    const x = parseFloat(this.getAttribute('x') || '0')
    const y = parseFloat(this.getAttribute('y') || '0')
    const width = parseFloat(this.getAttribute('width') || '100')
    const height = parseFloat(this.getAttribute('height') || '50')
    return { x, y, width, height } as DOMRect
  }
}

if (typeof SVGTextElement !== 'undefined') {
  SVGTextElement.prototype.getComputedTextLength = function() {
    const text = this.textContent || ''
    return text.length * 8
  }
}

vi.useFakeTimers()
vi.setSystemTime(0)
