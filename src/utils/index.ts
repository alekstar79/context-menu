interface FontMetrics {
  ascent: number
  descent: number
  height: number
}

const cache = new Map<string, FontMetrics>()

/**
 * Gets font metrics via Canvas.
 * @param font - font string in CSS format (e.g. 'bold 12px sans-serif')
 */
function getFontMetrics(font: string): FontMetrics {
  if (cache.has(font)) {
    return cache.get(font)!
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallback = { ascent: 9, descent: 3, height: 12 }
    cache.set(font, fallback)
    return fallback
  }

  ctx.font = font
  const metrics = ctx.measureText('A')
  const ascent = metrics.actualBoundingBoxAscent ?? 9
  const descent = metrics.actualBoundingBoxDescent ?? 3
  const height = ascent + descent

  const result = { ascent, descent, height }
  cache.set(font, result)

  return result
}

let hintFontMetrics: FontMetrics | null = null

/**
 * Returns the metrics of the font used for hints (class .radial-hint).
 * Measures once and caches the result.
 */
export function getHintFontMetrics(): FontMetrics {
  if (hintFontMetrics) return hintFontMetrics

  // Creating a temporary element to get real CSS styles
  const div = document.createElement('div')

  div.className = 'radial-hint'
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.pointerEvents = 'none'
  div.textContent = 'A'

  document.body.appendChild(div)

  const styles = window.getComputedStyle(div)
  const font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`

  document.body.removeChild(div)

  const metrics = getFontMetrics(font)
  hintFontMetrics = metrics

  return metrics
}

/**
 * Measures the length of text rendered on a straight line.
 * Useful for estimating arc length without creating a curved path.
 * @param {string} text - text content
 */
export function measureTextLengthOnLine(text: string): number {
  const svgNS = 'http://www.w3.org/2000/svg'
  const tempSvg = document.createElementNS(svgNS, 'svg')
  tempSvg.style.position = 'absolute'
  tempSvg.style.visibility = 'hidden'
  document.body.appendChild(tempSvg)

  const tempText = document.createElementNS(svgNS, 'text')
  tempText.textContent = text
  tempSvg.appendChild(tempText)

  const length = (tempText as SVGTextElement).getComputedTextLength()
  document.body.removeChild(tempSvg)

  return length
}

/**
 * @template T
 * @param {PromiseLike<T> | HTMLElement} value
 * @returns boolean
 */
export function isPromiseLike<T extends any>(value: any): value is PromiseLike<T> {
  return value && (value as PromiseLike<T>).then !== undefined
}
