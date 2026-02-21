import { isPromiseLike } from '@/utils'
import { Builder } from './builder'
import { IConfig } from './config'

export class Manager
{
  private menu: Builder

  public shown: boolean = false

  constructor(container: HTMLElement | PromiseLike<HTMLElement>, config: IConfig)
  {
    this.menu = new Builder(config)

    isPromiseLike(container)
      ? container.then((c) => c.appendChild(this.menu.element))
      : container.appendChild(this.menu.element)

    if (config.autoBindContextMenu !== false) {
      this.bindEvents()
    }
  }

  public bindEvents(el: HTMLElement | Window = window)
  {
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.toggle(e as PointerEvent)
    })
  }

  public on(event: string, callback: Function)
  {
    this.menu.on(event, callback)
  }

  public toggle(event: PointerEvent)
  {
    this.shown ? this.menu.hide() : this.menu.show(event)
  }

  public show(event: PointerEvent)
  {
    this.shown = true

    this.menu.show(event)
  }

  public hide()
  {
    this.shown = false

    this.menu.hide()
  }
}
