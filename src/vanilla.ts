import { type ISector, defineConfig } from '@/menu/config'
import { Manager } from '@/menu/manager'
import './scss/styles.scss'

const app = document.getElementById('app')

const content = `<div class="demo">
  <h1>Context Menu Vanilla Demo</h1>
  <p>Right-click anywhere on this page to open the context menu.</p>
  <p>Rotate the mouse wheel over the context menu</p>
  <p id="selected">Selected:</p>
</div>`

let selected: HTMLElement | null = null

if (app) {
  app.innerHTML = content

  const config = defineConfig({
    sprite: './img/radialnav/icons.svg',
    innerRadius: 75,
    outerRadius: 150,

    // color: 'orange',
    opacity: 0.7,

    hintPadding: 2,
    // Global overrides for all icons
    // iconRadius: 100, // Uncomment to move all icons further out
    iconScale: 0.75, // Uncomment to make all icons smaller
    sectors: [
      {
        icon: 'new',
        hint: 'New',
        onclick: chooseNew
      },
      {
        icon: 'open',
        hint: 'Open',
      },
      {
        icon: 'link',
        hint: 'Link',
      },
      {
        icon: 'webcam',
        hint: 'Webcam',
        // Manual override for a specific icon
        // iconRadius: 100, // Move this icon further out
        // iconScale: 0.5, // Make this icon smaller
      },
      {
        icon: 'calc',
        hint: 'Calculator',
      },
      {
        icon: 'pixabay',
        hint: 'Pixabay',
      }
    ],
    centralButton: {
      icon: 'about',
      hint: 'Home',
      // hintSpan: 180,
      // iconRadius: 50,
      // iconScale: 0.75
      // hintStartAngle: 290,
      // hintEndAngle: 70,
      // hintPosition: 'bottom',
      onclick: () => {
        console.log('Central button clicked')
      },
    }
  })

  const menu = new Manager(app, config)

  menu.on('click', choose)

  selected = app.querySelector('#selected')
}

function chooseNew()
{
  console.log('New file chosen')
}

function choose({ icon, hint }: ISector)
{
  console.log(`Menu item chosen: ${hint} (${icon})`)

  if (selected) {
    selected.textContent = `Selected: ${hint}`
  }
}
