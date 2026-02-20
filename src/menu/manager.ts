import { Builder } from './builder'
import { IConfig } from './config'

export class Manager
{
  private menu: Builder

  constructor(container: HTMLElement, config: IConfig)
  {
    this.menu = new Builder(config)
    container.appendChild(this.menu.element)

    if (config.autoBindContextMenu !== false) {
      this.bindEvents()
    }
  }

  private bindEvents()
  {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.menu.show(e)
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
