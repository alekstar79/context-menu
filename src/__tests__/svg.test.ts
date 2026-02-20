import { describe, it, expect, vi } from 'vitest'
import { Matrix } from '@/core/matrix'
import * as svg from '@/core/svg'

const { Element, Paper, Fragment, Svg } = svg

describe('Element', () => {
  it('should wrap an SVG element', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const el = new Element(svgElem)

    expect(el.node).toBe(svgElem)
    expect(el.type).toBe('svg')
  })

  it('should get/set attributes', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    const el = new Element(svgElem)

    el.attr('cx', 10)
    el.attr('cy', 20)
    el.attr('r', 5)

    expect(el.attr('cx')).toBe('10')
    expect(el.attr('cy')).toBe('20')
    expect(el.attr('r')).toBe('5')
  })

  it('should add/remove classes', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const el = new Element(svgElem)

    el.addClass('test-class')
    expect(svgElem.classList.contains('test-class')).toBe(true)
    el.removeClass('test-class')
    expect(svgElem.classList.contains('test-class')).toBe(false)
  })

  it('should transform with Matrix', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const el = new Element(svgElem)
    const m = new Matrix(1,0,0,1,10,20)

    el.transform(m)
    expect(svgElem.getAttribute('transform')).toBe('matrix(1,0,0,1,10,20)')
  })

  it('should transform with string', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const el = new Element(svgElem)

    el.transform('t10,20')
    expect(svgElem.getAttribute('transform')).toMatch(/matrix/)
  })

  it('should getBBox for element in DOM', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.appendChild(svg)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    rect.setAttribute('x', '10')
    rect.setAttribute('y', '20')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '50')
    svg.appendChild(rect)

    const el = new Element(rect)
    const bbox = el.getBBox()

    expect(bbox).toBeDefined()
    expect(bbox.width).toBe(100)
    expect(bbox.height).toBe(50)
  })

  it('should getBBox for element not in DOM using temporary SVG', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    rect.setAttribute('x', '10')
    rect.setAttribute('y', '20')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '50')

    const el = new Element(rect)
    const bbox = el.getBBox()

    expect(bbox).toBeDefined()
    expect(bbox.width).toBe(100)
    expect(bbox.height).toBe(50)
  })

  it('should select subelements', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.id = 'test'

    svg.appendChild(g)
    const el = new Element(svg)
    const found = el.select('#test')

    expect(found).not.toBeNull()
    expect(found?.node).toBe(g)
  })

  it('should selectAll subelements', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    for (let i = 0; i < 3; i++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.classList.add('item')
      svg.appendChild(rect)
    }

    const el = new Element(svg)
    const items = el.selectAll('.item')

    expect(items.length).toBe(3);
  })

  it('should clone element', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '10')

    const el = new Element(rect)
    const clone = el.clone()

    expect(clone.node).not.toBe(rect)
    expect(clone.attr('width')).toBe('10')
  })

  it('should add child element', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const parent = new Element(svg)
    const child = new Element(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
    parent.add(child)
    expect(svg.children.length).toBe(1)
  })

  it('should handle hover and mouseup events', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const el = new Element(rect)
    const mouseover = vi.fn()
    const mouseout = vi.fn()
    const mouseup = vi.fn()

    el.hover(mouseover, mouseout)
    el.mouseup(mouseup)

    rect.dispatchEvent(new MouseEvent('mouseover'))
    expect(mouseover).toHaveBeenCalled()

    rect.dispatchEvent(new MouseEvent('mouseout'))
    expect(mouseout).toHaveBeenCalled()

    rect.dispatchEvent(new MouseEvent('mouseup'))
    expect(mouseup).toHaveBeenCalled()
  })
})

describe('Paper', () => {
  it('should create from existing SVG element', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = new Paper(svg)

    expect(paper.node).toBe(svg)
    expect(paper.defs).toBeDefined()
  })

  it('should create group with g()', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = new Paper(svg)
    const group = paper.g()

    expect(group.node.tagName).toBe('g')
    expect(svg.children.length).toBe(2)
  })

  it('should create path with path()', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = new Paper(svg)
    const path = paper.path('M10 10 L20 20')

    expect(path.node.tagName).toBe('path')
    expect(path.attr('d')).toBe('M10 10 L20 20')
  })

  it('should create circle with circle()', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = new Paper(svg)
    const circle = paper.circle(50, 50, 10)

    expect(circle.node.tagName).toBe('circle')
    expect(circle.attr('cx')).toBe('50')
    expect(circle.attr('cy')).toBe('50')
    expect(circle.attr('r')).toBe('10')
  })

  it('should create text with text()', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = new Paper(svg)
    const text = paper.text(10, 20, 'Hello')

    expect(text.node.tagName).toBe('text')
    expect(text.attr('x')).toBe('10')
    expect(text.attr('y')).toBe('20')
    expect(text.node.textContent).toBe('Hello')
  })
})

describe('Fragment', () => {
  it('should wrap DocumentFragment', () => {
    const frag = document.createDocumentFragment()
    const div = document.createElement('div')

    frag.appendChild(div)

    const fragment = new Fragment(frag)

    expect(fragment.select('div')).not.toBeNull()
  })

  it('should select elements', () => {
    const frag = document.createDocumentFragment()
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    svg.innerHTML = '<g id="test"></g>'
    frag.appendChild(svg)

    const fragment = new Fragment(frag)
    const g = fragment.select('#test')

    expect(g).not.toBeNull()
    expect(g?.node.tagName).toBe('g')
  })

  it('should selectAll', () => {
    const frag = document.createDocumentFragment();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    svg.innerHTML = '<rect class="a"/><rect class="a"/>'
    frag.appendChild(svg)

    const fragment = new Fragment(frag)
    const rects = fragment.selectAll('.a')

    expect(rects.length).toBe(2)
  })
})

describe('Svg function', () => {
  it('should create Paper from existing SVG element', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const paper = Svg(svgElem)

    expect(paper).toBeInstanceOf(Paper)
  })

  it('should find Paper by query selector', () => {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    svgElem.id = 'test-svg'
    document.body.appendChild(svgElem)

    const paper = Svg('#test-svg')

    expect(paper).toBeInstanceOf(Paper)
    expect(paper?.node).toBe(svgElem)
  })

  it('should return null if query not found', () => {
    const paper = Svg('#nonexistent')
    expect(paper).toBeNull()
  })
})
