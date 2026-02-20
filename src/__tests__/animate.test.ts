import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { animate } from '@/core/animate'
import { mina } from '@/core/easing'

describe('animate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should animate from one number to another', () => {
    const setter = vi.fn()

    animate(0, 100, setter, 1000, mina.linear)

    vi.runAllTimers()

    const lastCall = setter.mock.lastCall?.[0]

    expect(lastCall).toBeCloseTo(100, 1)
  })

  it('should animate array values', () => {
    const setter = vi.fn()

    animate([0, 0], [100, 200], setter, 1000, mina.linear)

    vi.runAllTimers()

    const lastCall = setter.mock.lastCall?.[0]

    expect(lastCall[0]).toBeCloseTo(100, 1)
    expect(lastCall[1]).toBeCloseTo(200, 1)
  })

  it('should call callback after animation', () => {
    const callback = vi.fn()

    animate(0, 1, () => {}, 100, mina.linear, callback)

    vi.runAllTimers()
    expect(callback).toHaveBeenCalled()
  })

  it('should stop animation when stop is called', () => {
    const setter = vi.fn()
    const anim = animate(0, 100, setter, 1000, mina.linear)

    vi.advanceTimersByTime(200)
    const callsBeforeStop = setter.mock.calls.length

    anim.stop()
    vi.advanceTimersByTime(800)
    expect(setter.mock.calls.length).toBe(callsBeforeStop)
  })
})
