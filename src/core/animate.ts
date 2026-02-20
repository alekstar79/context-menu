import { mina } from './easing'

export interface AnimationHandle {
  stop(): void;
}

export function animate(
  from: number | number[],
  to: number | number[],
  setter: (val: any) => void,
  duration: number,
  easing: (n: number) => number = mina.linear,
  callback?: () => void
): AnimationHandle {
  const start = performance.now()
  let cancelled = false
  let frame = 0

  const step = (now: number) => {
    if (cancelled) return

    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = easing(progress)

    if (Array.isArray(from) && Array.isArray(to)) {
      const val = from.map((f, i) => f + (to[i] - f) * eased)
      setter(val)
    } else {
      const val = (from as number) + ((to as number) - (from as number)) * eased
      setter(val)
    }

    if (progress < 1) {
      frame = requestAnimationFrame(step)
    } else {
      callback?.()
    }
  }

  frame = requestAnimationFrame(step)

  return {
    stop: () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }
}
