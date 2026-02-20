import { isPromiseLike } from '@/utils'
import { Builder } from './builder'
import { IConfig } from './config'

export class Manager
{
  private menu: Builder

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
      this.menu.show(e as MouseEvent)
    })
  }

  public on(event: string, callback: Function)
  {
    this.menu.on(event, callback)
  }

  public show(event: PointerEvent)
  {
    this.menu.show(event)
  }

  public hide()
  {
    this.menu.hide()
  }
}
