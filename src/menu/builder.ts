import type { ICentralButton, IConfig, ISector } from './config'

import { getHintFontMetrics, measureTextLengthOnLine } from '@/utils/text-metrics'
import { animate, Matrix, mina, parse, Svg } from '@/core'

interface HintData {
  baseRadius: number;
  textLength: number;
  sectorMidAngle: number;
}

const clamp = (v: number, l: number, h: number) => (v > h ? h : v < l ? l : v)

const hintDataMap = new WeakMap<Svg.Element, HintData>()
const iconInitialData = new WeakMap<Svg.Element, {
  midRadius: number;
  scale: number;
  rotation: number;
  bbox: Svg.BBox;
}>()

function polarToCartesian(cx: number, cy: number, r: number, angle: number): { x: number, y: number }
{
  angle = ((angle - 90) * Math.PI) / 180

  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number, lineMove: boolean, alter: boolean): string
{
  const start = polarToCartesian(x, y, r, (startAngle %= 360))
  const end = polarToCartesian(x, y, r, (endAngle %= 360))

  return `${lineMove ? 'L' : 'M'}${start.x} ${start.y} A${r} ${r}, 0, ${endAngle - startAngle >= 180 ? 1 : 0}, ${alter ? 0 : 1}, ${end.x} ${end.y}`
}

function describeSector(x: number, y: number, r: number, r2: number, startAngle: number, endAngle: number): string
{
  return `${describeArc(x, y, r, startAngle, endAngle, false, false)} ${describeArc(x, y, r2, endAngle, startAngle, true, true)}Z`
}

export class Builder
{
  private readonly config: IConfig
  private readonly events: { [key: string]: Function[] } = {}

  private readonly container: Svg.Paper
  private readonly snap: Svg.Paper

  private readonly angle: number
  private readonly size: number = 500
  private readonly c = this.size / 2

  public element: HTMLElement
  private area: Svg.Paper

  private duration = 300

  private icons: Svg.Fragment | null = null
  private theme = 'light'

  constructor(config: IConfig)
  {
    this.config = config
    this.size = 2 * config.outerRadius
    this.c = this.size / 2
    this.angle = 360 / (this.config.sectors.length || 6)

    this.element = this.createMenuElement()
    this.snap = Svg(this.element.querySelector('svg')!)
    this.area = this.snap
    this.container = this.area.g().transform('s0')

    this.init().catch(console.error)
  }

  private createMenuElement(): HTMLElement
  {
    const div = document.createElement('div')
    div.className = 'context theme--light hidden'
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '100vw'
    div.style.height = '100vh'
    div.style.overflow = 'visible'
    div.style.pointerEvents = 'auto'

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', this.size.toString())
    svg.setAttribute('height', this.size.toString())
    svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size}`)
    svg.style.position = 'absolute'
    svg.style.display = 'block'
    svg.style.overflow = 'visible'
    svg.style.pointerEvents = 'auto'
    svg.classList.add('radial-menu-svg')

    svg.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.transformOpacity(e)
    })

    svg.addEventListener('contextmenu', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.hide()
    })

    svg.addEventListener('click', (e) => {
      e.stopPropagation()
      this.hide()
    })

    div.addEventListener('click', (e) => {
      if (e.target === div) {
        this.hide()
      }
    })

    div.appendChild(svg)

    return div
  }

  private async init(): Promise<void>
  {
    await this.loadIcons()
    this.updateButtons()
  }

  private async loadIcons(): Promise<void>
  {
    if (this.icons) return

    try {
      const response = await fetch(this.config.sprite)
      if (response.ok) {
        this.icons = parse(await response.text())
      }
    } catch (e) {
      console.error('Failed to load icons:', e)
    }
  }

  private updateButtons(): void
  {
    if (!this.icons || !this.container) return

    this.container.clear()
    this.config.sectors.forEach(btn => {
      const icon = this.createIcon(btn)

      if (icon) {
        const buttonGroup = this.createButton(btn, this.createSector(), icon, this.createHint(btn))
        this.container.add(buttonGroup)
      }
    })

    if (this.config.centralButton) {
      const centralBtn = this.createCentralButton(this.config.centralButton)
      if (centralBtn) {
        this.container.add(centralBtn)
      }
    }
  }

  private createSector(): Svg.Element
  {
    const color = this.config.color ?? '#1976D2'

    return this.area.path(describeSector(this.c, this.c, this.config.outerRadius, this.config.innerRadius, 0, this.angle))
      .attr({ fill: color, stroke: color, opacity: this.config.opacity })
      .addClass('radial-sector')
  }

  private createButton(btn: ISector, sector: Svg.Element, icon: Svg.Element, hint: Svg.Element): Svg.Paper
  {
    const buttonGroup = this.area.g(sector, icon, hint)

    buttonGroup.hover(
      () => {
        buttonGroup.select('.radial-hint')?.addClass('active')
        const bg = buttonGroup.select('.radial-hint-bg')
        if (bg) {
          bg.addClass('active')
          bg.node.style.opacity = String(this.config.opacity)
        }
        this.animateButtonHover(buttonGroup, 0, 1, 200, mina.easeinout)
      },
      () => {
        buttonGroup.select('.radial-hint')?.removeClass('active')
        const bg = buttonGroup.select('.radial-hint-bg')
        if (bg) {
          bg.removeClass('active')
          bg.node.style.opacity = '0'
        }
        this.animateButtonHover(buttonGroup, 1, 0, 2000, mina.elastic)
      }
    )

    buttonGroup.mouseup((e) => {
      if (e.button !== 0) return
      this.emit('click', { icon: btn.icon, hint: btn.hint })
      btn.onclick?.()
    })

    return buttonGroup
  }

  private createIcon(btn: ISector): Svg.Element | null
  {
    if (!this.icons) return null

    const iconTemplate = this.icons.select(`#${btn.icon}`)
    if (!iconTemplate) {
      console.error(`Icon #${btn.icon} not found in SVG`)
      return null
    }

    const icon = iconTemplate.clone()
    const bbox = icon.getBBox()

    const defaultRadius = (this.config.innerRadius + this.config.outerRadius) / 2
    const sectorHeight = this.config.outerRadius - this.config.innerRadius
    const defaultScale = (sectorHeight * 0.5) / bbox.height

    const midRadius = btn.iconRadius ?? this.config.iconRadius ?? defaultRadius
    const scale = btn.iconScale ?? this.config.iconScale ?? defaultScale
    const targetAngle = this.angle / 2
    const rotation = targetAngle + (btn.rotate || 0)

    iconInitialData.set(icon, { midRadius, scale, rotation, bbox })

    const pos = polarToCartesian(this.c, this.c, midRadius, targetAngle)
    const t = new Matrix()

    t.translate(pos.x, pos.y)
    t.scale(scale)
    t.rotate(rotation, 0, 0)
    t.translate(-bbox.cx, -bbox.cy)

    icon.transform(t)

    return icon.addClass('radial-icon')
  }

  private createHint(btn: ISector): Svg.Element
  {
    const group = this.area.g()
    group.addClass('hint-group')
    const hintPadding = btn.hintPadding ?? this.config.hintPadding
    const metrics = getHintFontMetrics()
    const text = btn.hint || btn.icon

    const textLength = measureTextLengthOnLine(text)
    const gap = 2

    let baseRadius: number
    let bgHeight = 0

    if (hintPadding !== undefined) {
      bgHeight = metrics.height + 2 * hintPadding
      baseRadius = this.config.outerRadius + bgHeight / 2 + gap
    } else {
      const textOffset = metrics.height * 0.75
      baseRadius = this.config.outerRadius + textOffset
    }

    const textAngleRad = textLength / baseRadius
    const textAngleDeg = textAngleRad * 180 / Math.PI
    const sectorMidAngle = this.angle / 2
    const startAngle = sectorMidAngle - textAngleDeg / 2
    const endAngle = sectorMidAngle + textAngleDeg / 2

    const arcPath = describeArc(this.c, this.c, baseRadius, startAngle, endAngle, false, false)

    if (hintPadding !== undefined) {
      const bgColor = this.config.color ?? '#1976D2'
      const bg = this.area.path(arcPath).attr({
        'stroke': bgColor,
        'stroke-width': `${bgHeight}`,
        'stroke-linecap': 'round',
        'fill': 'none',
        'vector-effect': 'non-scaling-stroke'
      })
        .addClass('radial-hint-bg')
      bg.node.style.opacity = '0'
      group.add(bg)
    }

    const hint = this.area.text(0, 0, text)
      .addClass('radial-hint').attr({
        fill: this.theme === 'light' ? '#333333' : '#7a7a7a',
        textpath: arcPath
      })

    const textPathEl = hint.select('textPath')
    if (textPathEl) {
      textPathEl.attr('dominant-baseline', 'central')
      textPathEl.attr('startOffset', '50%')
    }

    group.add(hint)

    hintDataMap.set(group, {
      sectorMidAngle,
      baseRadius,
      textLength
    })

    return group
  }

  private createCentralButton(btn: ICentralButton): Svg.Element | null
  {
    const defaultRadius = this.config.innerRadius * 0.6
    const buttonRadius = btn.iconRadius ?? this.config.iconRadius ?? defaultRadius
    const color = this.config.color ?? '#1976D2'

    const circle = this.area.circle({
      cx: this.c, cy: this.c, r: buttonRadius,
      fill: color, stroke: color,
      opacity: this.config.opacity
    })
      .addClass('radial-sector central-sector')

    circle.node.dataset.initialRadius = `${buttonRadius}`

    let icon: Svg.Element | null = null
    let hint: Svg.Element | null = null

    if (btn.icon) {
      icon = this.createCentralIcon(btn, buttonRadius)
    }
    if (btn.hint) {
      hint = this.createCentralHint(btn, buttonRadius)
    }

    const elements = [circle, icon, hint].filter(el => el !== null) as Svg.Element[]
    const buttonGroup = this.area.g(...elements).addClass('central-button')

    buttonGroup.hover(
      () => {
        buttonGroup.select('.central-hint')?.addClass('active')
        const bg = buttonGroup.select('.radial-hint-bg')
        if (bg) {
          bg.addClass('active')
          bg.node.style.opacity = String(this.config.opacity)
        }
        this.animateCentralHover(buttonGroup, true)
      },
      () => {
        buttonGroup.select('.central-hint')?.removeClass('active')
        const bg = buttonGroup.select('.radial-hint-bg')
        if (bg) {
          bg.removeClass('active')
          bg.node.style.opacity = '0'
        }
        this.animateCentralHover(buttonGroup, false)
      }
    )

    buttonGroup.mouseup((e) => {
      if (e.button !== 0) return

      this.emit('click', { icon: btn.icon, hint: btn.hint || '' })
      btn.onclick?.()
    })

    return buttonGroup
  }

  private createCentralIcon(btn: ICentralButton, buttonRadius: number): Svg.Element | null
  {
    if (!this.icons) return null

    const iconTemplate = this.icons.select(`#${btn.icon}`)
    if (!iconTemplate) {
      console.error(`Icon #${btn.icon} not found in SVG`)
      return null
    }

    const icon = iconTemplate.clone()
    const bbox = icon.getBBox()

    const defaultScale = (buttonRadius * 0.8) / Math.max(bbox.width, bbox.height)
    const scale = btn.iconScale ?? this.config.iconScale ?? defaultScale
    const t = new Matrix()

    t.translate(this.c, this.c)
    t.scale(scale)
    t.translate(-bbox.cx, -bbox.cy)

    icon.transform(t).addClass('radial-icon central-icon')

    iconInitialData.set(icon, {
      midRadius: 0,
      rotation: 0,
      scale,
      bbox
    })

    return icon
  }

  private createCentralHint(btn: ICentralButton, buttonRadius: number): Svg.Element
  {
    const group = this.area.g()
    const hintPadding = btn.hintPadding ?? this.config.hintPadding
    const metrics = getHintFontMetrics()
    const text = btn.hint ?? ''
    // const textLength = measureTextLengthOnLine(text)

    let baseOffset: number
    let bgHeight = 0
    const gap = 2

    if (hintPadding !== undefined) {
      bgHeight = metrics.height + 2 * hintPadding
      baseOffset = btn.hintOffset ?? (bgHeight / 2 + gap)
    } else {
      if (btn.hintOffset != null) {
        baseOffset = btn.hintOffset
      } else {
        baseOffset = btn.hintDistance ?? 8
      }
    }

    const textRadius = buttonRadius + baseOffset

    let startAngle: number, endAngle: number, alter: boolean
    if (btn.hintStartAngle != null && btn.hintEndAngle != null) {
      startAngle = btn.hintStartAngle
      endAngle = btn.hintEndAngle
      alter = startAngle > endAngle
    } else {
      const span = btn.hintSpan ?? 120
      const half = span / 2
      const position = btn.hintPosition ?? 'top'

      if (position === 'bottom') {
        startAngle = 180 + half
        endAngle = 180 - half
        alter = true
      } else {
        startAngle = 360 - half
        endAngle = half
        alter = false
      }
    }

    const arcPath = describeArc(this.c, this.c, textRadius, startAngle, endAngle, false, alter)

    if (hintPadding !== undefined) {
      const bgColor = this.config.color ?? '#1976D2'
      const bg = this.area.path(arcPath).attr({
        'stroke': bgColor,
        'stroke-width': `${bgHeight}`,
        'stroke-linecap': 'round',
        'fill': 'none',
        'vector-effect': 'non-scaling-stroke'
      })
        .addClass('radial-hint-bg')

      bg.node.style.opacity = '0'
      group.add(bg)
    }

    const hint = this.area.text(0, 0, text)
      .addClass('radial-hint central-hint')
      .attr({
        fill: this.theme === 'light' ? '#333333' : '#7a7a7a',
        textpath: arcPath
      })

    const textPathEl = hint.select('textPath')
    if (textPathEl) {
      textPathEl.attr('dominant-baseline', 'central')
      textPathEl.attr('startOffset', '50%')
    }

    const hintNode = hint.node
    hintNode.dataset.hintOffset = baseOffset.toString()
    hintNode.dataset.startAngle = startAngle.toString()
    hintNode.dataset.endAngle = endAngle.toString()
    hintNode.dataset.alter = alter ? 'true' : 'false'
    hintNode.dataset.centerX = this.c.toString()
    hintNode.dataset.centerY = this.c.toString()

    group.add(hint)

    return group
  }

  public show(e: MouseEvent): void
  {
    this.element.classList.remove('hidden')

    const svg = this.element.querySelector('svg') as SVGSVGElement

    svg.style.left = (e.clientX - this.c) + 'px'
    svg.style.top = (e.clientY - this.c) + 'px'

    this.animateContainer(0, 1, this.duration * 8, mina.elastic)
    this.animateButtons(0, 1, this.duration, this.duration * 8, mina.elastic)
  }

  public hide(): void
  {
    this.animateContainer(1, 0, this.duration, mina.easeinout, () => {
      this.element.classList.add('hidden')
    })

    this.animateButtons(1, 0, this.duration, this.duration, mina.easeinout)
  }

  private animate(obj: any, index: number, start: number, end: number, duration: number, easing: (n: number) => number, fn: (val: number) => void, cb?: () => void): void
  {
    obj.animation ||= []
    obj.animation[index]?.stop()
    obj.animation[index] = animate(start, end, fn, duration, easing, cb)
  }

  private animateContainer(start: number, end: number, duration: number, easing: (n: number) => number, cb?: () => void): void
  {
    this.animate(this, 0, start, end, duration, easing, (val) => {
      this.container.transform(`r${90 - 90 * val},${this.c},${this.c}s${val},${val},${this.c},${this.c}`)
    }, cb)
  }

  private animateButtons(start: number, end: number, min: number, max: number, easing: (n: number) => number): void
  {
    const r = (min: number, max: number) => Math.random() * (max - min) + min

    this.container.children().forEach((el: Svg.Element, i: number) => {
      const isCentral = el.node.classList.contains('central-button')

      this.animate(el, 0, start, end, r(min, max), easing, (val) => {
        if (isCentral) {
          el.transform(`s${val},${val},${this.c},${this.c}`)
        } else {
          el.transform(`r${this.angle * i},${this.c},${this.c}s${val},${val},${this.c},${this.c}`)
        }
      })
    })
  }

  private animateButtonHover(buttonGroup: Svg.Paper, start: number, end: number, duration: number, easing: (n: number) => number, cb?: () => void): void
  {
    const icon = buttonGroup.select('.radial-icon')
    const initialIcon = icon ? iconInitialData.get(icon) : undefined
    const hintGroup = buttonGroup.select('.hint-group')
    const hintData = hintGroup ? hintDataMap.get(hintGroup) : undefined

    this.animate(buttonGroup, 1, start, end, duration, easing, (val) => {
      const outward = val * 10

      buttonGroup.select('.radial-sector')?.attr({
        d: describeSector(this.c, this.c, this.config.outerRadius - outward, this.config.innerRadius, 0, this.angle)
      })

      if (icon && initialIcon) {
        const newRadius = initialIcon.midRadius - outward
        const newScale = initialIcon.scale * (1 - (val * 0.1))
        const targetAngle = this.angle / 2
        const pos = polarToCartesian(this.c, this.c, newRadius, targetAngle)
        const t = new Matrix()

        t.translate(pos.x, pos.y)
        t.scale(newScale)
        t.rotate(initialIcon.rotation, 0, 0)
        t.translate(-initialIcon.bbox.cx, -initialIcon.bbox.cy)

        icon.transform(t)
      }

      if (hintData && hintGroup) {
        const newRadius = hintData.baseRadius - outward
        const newAngleDeg = (hintData.textLength / newRadius) * 180 / Math.PI
        const newStart = hintData.sectorMidAngle - newAngleDeg / 2
        const newEnd = hintData.sectorMidAngle + newAngleDeg / 2
        const newPath = describeArc(this.c, this.c, newRadius, newStart, newEnd, false, false)

        const hint = hintGroup.select('.radial-hint')
        if (hint) {
          hint.attr('textpath', newPath)
        }

        const bg = hintGroup.select('.radial-hint-bg')
        if (bg) {
          bg.attr('d', newPath)
        }
      }
    }, cb)
  }

  private animateCentralHover(group: Svg.Element, active: boolean): void
  {
    const circle = group.select('.central-sector') as Svg.Element
    const icon = group.select('.central-icon') as Svg.Element
    const hint = group.select('.central-hint') as Svg.Element
    const bg = group.select('.radial-hint-bg') as Svg.Element

    if (!circle || !icon) return

    const initialRadius = parseFloat(circle.node.dataset.initialRadius || '30')
    const currentRadius = parseFloat(circle.attr('r') as string)
    const targetRadius = active ? initialRadius - 8 : initialRadius

    const initialIconData = icon ? iconInitialData.get(icon) : undefined

    let hintOffset = 12, startAngle = 0, endAngle = 0, centerX = this.c, centerY = this.c, alter = false
    if (hint) {
      hintOffset = parseFloat(hint.node.dataset.hintOffset || '12')
      startAngle = parseFloat(hint.node.dataset.startAngle || '0')
      endAngle = parseFloat(hint.node.dataset.endAngle || '0')
      centerX = parseFloat(hint.node.dataset.centerX || this.c.toString())
      centerY = parseFloat(hint.node.dataset.centerY || this.c.toString())
      alter = hint.node.dataset.alter === 'true'
    }

    animate(currentRadius, targetRadius, (val) => {
      circle.attr('r', val)

      if (icon && initialIconData) {
        const newScale = initialIconData.scale * (val / initialRadius)
        const t = new Matrix()
        t.translate(this.c, this.c)
        t.scale(newScale)
        t.translate(-initialIconData.bbox.cx, -initialIconData.bbox.cy)
        icon.transform(t)
      }

      if (hint) {
        const newRadius = val + hintOffset
        const newArc = describeArc(centerX, centerY, newRadius, startAngle, endAngle, false, alter)
        hint.attr({ textpath: newArc })
        if (bg) {
          bg.attr({ d: newArc })
        }
      }
    }, 200, mina.easeinout)
  }

  private transformOpacity(e: WheelEvent): void
  {
    const dy = e.deltaY > 0 ? 0.03 : -0.03
    this.config.opacity = clamp(this.config.opacity + dy, 0.4, 1)

    this.area.selectAll('.radial-sector').forEach((el: Svg.Element) => {
      el.attr({ opacity: this.config.opacity })
    })

    this.area.selectAll('.radial-hint-bg.active').forEach((el: Svg.Element) => {
      el.node.style.opacity = String(this.config.opacity)
    })
  }

  public on(event: string, callback: Function): void
  {
    (this.events[event] ??= []).push(callback)
  }

  private emit(event: string, data: any): void
  {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }
}
