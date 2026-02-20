import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Builder } from '@/menu/builder'
import { IConfig } from '@/menu/config'

vi.mock('@/utils/text-metrics', () => ({
  measureTextLengthOnLine: vi.fn(() => 100),
  getHintFontMetrics: vi.fn(() => ({
    ascent: 5, descent: 2, height: 7
  }))
}))


globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<svg><g id="new"></g><g id="open"></g><g id="link"></g><g id="webcam"></g><g id="calc"></g><g id="pixabay"></g><g id="match"></g></svg>'),
  } as Response)
)

describe('CircularMenu', () => {
  let container: HTMLElement
  let config: IConfig

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.useFakeTimers()
    vi.setSystemTime(0)

    config = {
      sprite: '/icons.svg',
      innerRadius: 75,
      outerRadius: 150,
      opacity: 0.5,
      sectors: [
        { icon: 'new', hint: 'New' },
        { icon: 'open', hint: 'Open' },
        { icon: 'link', hint: 'Link' },
        { icon: 'webcam', hint: 'Webcam' },
        { icon: 'calc', hint: 'Calculator' },
        { icon: 'pixabay', hint: 'Pixabay' },
      ],
      centralButton: {
        icon: 'match',
        hint: 'Home',
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create menu element', async () => {
    const menu = new Builder(config)
    await vi.runAllTimersAsync()
    expect(menu.element).toBeDefined()
    expect(menu.element.classList.contains('context')).toBe(true)
  })

  it('should show/hide menu', async () => {
    const menu = new Builder(config)
    await vi.runAllTimersAsync()

    const event = new MouseEvent('contextmenu', { clientX: 100, clientY: 200 })
    menu.show(event)
    expect(menu.element.classList.contains('hidden')).toBe(false)

    menu.hide()
    vi.advanceTimersByTime(1000)
    expect(menu.element.classList.contains('hidden')).toBe(true)
  })

  it('should emit click event on sector click', async () => {
    const menu = new Builder(config)
    await vi.runAllTimersAsync()

    const callback = vi.fn()
    menu.on('click', callback)

    const event = new MouseEvent('contextmenu', { clientX: 100, clientY: 200 })
    menu.show(event)
    await vi.runAllTimersAsync()

    const newIcon = menu.element.querySelector('#new') as SVGElement
    expect(newIcon).not.toBeNull()
    const group = newIcon.closest('g[transform]')
    expect(group).not.toBeNull()

    group!.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }))
    expect(callback).toHaveBeenCalledWith({ icon: 'new', hint: 'New' })
  })

  it('should change opacity on wheel', async () => {
    const menu = new Builder(config)
    await vi.runAllTimersAsync()

    const svg = menu.element.querySelector('svg')!
    const wheelEvent = new WheelEvent('wheel', { deltaY: 100, bubbles: true })
    svg.dispatchEvent(wheelEvent)

    const sectors = svg.querySelectorAll('.radial-sector')
    sectors.forEach(sector => {
      const opacity = sector.getAttribute('opacity')
      expect(opacity).toBe('0.53')
    })
  })
})
