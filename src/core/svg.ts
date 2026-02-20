// noinspection JSUnusedGlobalSymbols

import { transform2matrix } from './transform'
import { Matrix } from './matrix'

let idCounter = 0
const elementCache = new WeakMap<SVGElement, Element>()

function getElement(node: SVGElement, paper?: Paper): Element {
  if (elementCache.has(node)) {
    const el = elementCache.get(node)!

    if (paper && !el.paper) {
      el.paper = paper
    }

    return el
  }

  const el = new Element(node, paper)
  elementCache.set(node, el)

  return el
}

export class Element {
  node: SVGElement
  paper?: Paper
  _id: string

  constructor(node: SVGElement, paper?: Paper) {
    this.node = node
    this.paper = paper
    this._id = 'e' + (idCounter++).toString(36)
  }

  get type(): string {
    return this.node.tagName
  }

  get id(): string {
    return this.node.id || this._id
  }

  parent(): Element | null {
    return this.node.parentNode ? getElement(this.node.parentNode as SVGElement, this.paper) : null
  }

  children(): Element[] {
    return Array.from(this.node.children).map(child => {
      return getElement(child as SVGElement, this.paper)
    })
  }

  clear(): this {
    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild)
    }

    return this
  }

  attr(): any;
  attr(name: string): string | null
  attr(name: string, value: any): this
  attr(attrs: Record<string, any>): this
  attr(nameOrAttrs?: string | Record<string, any>, value?: any): any {
    if (typeof nameOrAttrs === 'string') {
      if (value === undefined) {
        return this.node.getAttribute(nameOrAttrs)
      }

      this._setAttr(nameOrAttrs, value)

      return this
    }
    if (typeof nameOrAttrs === 'object') {
      for (const key in nameOrAttrs) {
        this._setAttr(key, nameOrAttrs[key])
      }

      return this
    }

    return this
  }

  private _setAttr(name: string, value: any) {
    if (name === 'textpath') {
      this._setTextPath(value)
    } else if (name === 'text') {
      this._setText(value)
    } else {
      this.node.setAttribute(name, String(value))
    }
  }

  private _setText(content: string) {
    const textPath = this.node.querySelector('textPath')

    if (textPath) {
      textPath.textContent = content
    } else {
      this.node.textContent = content
    }
  }

  private _setTextPath(pathDescriptor: string) {
    if (this.node.tagName !== 'text') return

    const textEl = this.node as SVGTextElement

    let textPath = textEl.querySelector('textPath')
    let existingText = ''

    if (!textPath) {
      for (let i = 0; i < textEl.childNodes.length; i++) {
        const node = textEl.childNodes[i]
        if (node.nodeType === 3) existingText += node.textContent
      }

      while (textEl.firstChild) {
        textEl.removeChild(textEl.firstChild)
      }

      textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
      textEl.appendChild(textPath)
      textEl.removeAttribute('x')
      textEl.removeAttribute('y')
    } else {
      existingText = textPath.textContent || ''
    }

    let href: string
    if (pathDescriptor.startsWith('#')) {
      href = pathDescriptor
    } else {
      if (!this.paper) {
        throw new Error('No paper reference for creating defs');
      }

      const defs = this.paper.defs
      const pathId = 'p' + Date.now() + Math.random().toString(36).slice(2)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      path.setAttribute('d', pathDescriptor)
      path.id = pathId
      defs.node.appendChild(path)
      href = '#' + pathId
    }

    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href)
    if (existingText) {
      textPath.textContent = existingText
    }
  }

  addClass(className: string): this {
    const classes = className.trim().split(/\s+/)

    for (const cls of classes) {
      if (cls) this.node.classList.add(cls)
    }

    return this
  }

  removeClass(className: string): this {
    const classes = className.trim().split(/\s+/)

    for (const cls of classes) {
      if (cls) this.node.classList.remove(cls)
    }

    return this
  }

  transform(t?: string | Matrix): this {
    if (t === undefined) return this
    if (t instanceof Matrix) {
      this.node.setAttribute('transform', t.toString())
    } else {
      const m = transform2matrix(t);
      this.node.setAttribute('transform', m.toString())
    }

    return this
  }

  getBBox(): { x: number; y: number; width: number; height: number; cx: number; cy: number; x2: number; y2: number } {
    if (this.node.isConnected) {
      const rect = (this.node as SVGGraphicsElement).getBBox()

      return {
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2,
        x2: rect.x + rect.width, y2: rect.y + rect.height
      }
    }

    const svgNS = 'http://www.w3.org/2000/svg'
    const tempSvg = document.createElementNS(svgNS, 'svg')

    tempSvg.style.position = 'absolute'
    tempSvg.style.visibility = 'hidden'
    tempSvg.style.pointerEvents = 'none'

    document.body.appendChild(tempSvg)

    tempSvg.appendChild(this.node)
    const rect = (this.node as SVGGraphicsElement).getBBox()
    tempSvg.removeChild(this.node)

    document.body.removeChild(tempSvg)

    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2,
      x2: rect.x + rect.width, y2: rect.y + rect.height
    }
  }

  select(selector: string): Element | null {
    const found = this.node.querySelector(selector)
    return found ? getElement(found as SVGElement, this.paper) : null
  }

  selectAll(selector: string): Element[] {
    const nodes = this.node.querySelectorAll(selector)

    return Array.from(nodes).map(node => {
      return getElement(node as SVGElement, this.paper)
    })
  }

  clone(): Element {
    return getElement(this.node.cloneNode(true) as SVGElement, this.paper)
  }

  add(child: Element): this {
    this.node.appendChild(child.node)
    return this
  }

  hover(fIn: (e: MouseEvent) => void, fOut: (e: MouseEvent) => void): this {
    this.node.addEventListener('mouseover', fIn)
    this.node.addEventListener('mouseout', fOut)
    return this
  }

  mouseup(fn: (e: MouseEvent) => void): this {
    this.node.addEventListener('mouseup', fn)
    return this
  }
}

export class Paper extends Element {
  defs: Element

  constructor(node: SVGSVGElement) {
    super(node, null as any)
    this.paper = this

    elementCache.set(node, this)

    let defsNode = node.querySelector('defs')
    if (!defsNode) {
      defsNode = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      node.appendChild(defsNode)
    }

    this.defs = getElement(defsNode as SVGElement, this)
  }

  g(...args: any[]): Paper {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.node.appendChild(group)
    const groupEl = getElement(group, this)

    if (args.length === 1 && args[0] && !args[0].node) {
      groupEl.attr(args[0])
    } else if (args.length) {
      args.forEach(arg => {
        if (arg instanceof Element) groupEl.add(arg)
      })
    }

    return groupEl as unknown as Paper
  }

  path(d?: string | object): Element {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    this.node.appendChild(path)

    const pathEl = getElement(path, this)
    if (d) {
      if (typeof d === 'string') {
        pathEl.attr('d', d)
      }

      else pathEl.attr(d)
    }

    return pathEl
  }

  circle(cx: any, cy?: number, r?: number): Element {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    this.node.appendChild(circle)

    const circleEl = getElement(circle, this)
    if (typeof cx === 'object') {
      circleEl.attr(cx)
    } else if (cx != null) {
      circleEl.attr({ cx, cy: cy ?? cx, r: r ?? 0 })
    }

    return circleEl
  }

  text(x: any, y?: number, text?: string): Element {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')

    this.node.appendChild(textEl)

    const textElWrap = getElement(textEl, this)
    if (typeof x === 'object') {
      textElWrap.attr(x)
    } else if (x != null) {
      textElWrap.attr({ x, y: y ?? x, text: text ?? '' })
    }

    return textElWrap
  }
}

export class Fragment {
  private frag: DocumentFragment

  constructor(frag: DocumentFragment) {
    this.frag = frag
  }

  select(selector: string): Element | null {
    const found = this.frag.querySelector(selector)
    return found ? getElement(found as SVGElement) : null
  }

  selectAll(selector: string): Element[] {
    const nodes = this.frag.querySelectorAll(selector)
    return Array.from(nodes).map(node => getElement(node as SVGElement))
  }
}

export function Svg(el: SVGSVGElement): Paper
export function Svg(query: string): Paper | null
export function Svg(arg: any): any {
  if (typeof arg === 'string') {
    const el = document.querySelector(arg)
    return el ? new Paper(el as SVGSVGElement) : null
  }
  if (arg instanceof SVGSVGElement) {
    return new Paper(arg)
  }

  return null
}
