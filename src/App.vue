<template>
  <div class="demo" @contextmenu.prevent="handleContextMenu">
    <h1>Context Menu Vue Demo</h1>
    <p>Right-click anywhere on this page to open the context menu.</p>
    <p>Rotate the mouse wheel over the context menu</p>
    <p>Selected: {{ lastSelected }}</p>
  </div>

  <ContextMenu
    ref="menuRef"
    @click="onMenuItemClick"
    :central-button="centralButton"
    :hint-padding="2"
    :inner-radius="75"
    :outer-radius="150"
    :opacity="0.8"
    :sectors="sectors"
    :sprite="sprite"
    color="#42B883"
  />
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import type { ISector } from './menu/config'

const sprite = '/img/radialnav/icons.svg'

const sectors: ISector[] = [
  { icon: 'new', hint: 'New' },
  { icon: 'open', hint: 'Open' },
  { icon: 'link', hint: 'Link' },
  { icon: 'webcam', hint: 'Webcam' },
  { icon: 'calc', hint: 'Calculator' },
  { icon: 'pixabay', hint: 'Pixabay' }
]

const centralButton = {
  icon: 'about',
  hint: 'Home',
  hintSpan: 180,
  hintPosition: 'bottom' as const
}

const menuRef = useTemplateRef('menuRef')
const lastSelected = ref('none')

function handleContextMenu(event: PointerEvent) {
  // You can attach the handler to a specific element (autoBindContextMenu: false)
  // or set autoBindContextMenu: true, and the manager will
  // attach the handler to the window
  menuRef.value?.show(event)
}

function onMenuItemClick(data: { icon: string; hint: string }) {
  lastSelected.value = `${data.hint}`
  console.log('Menu item clicked:', data)
}
</script>
