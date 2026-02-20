<template></template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import type { IConfig, ISector } from '@/menu/config'
import { Manager } from '@/menu/manager'

interface Props {
  sprite: string;
  innerRadius: number;
  outerRadius: number;
  opacity?: number;
  iconScale?: number;
  iconRadius?: number;
  sectors: ISector[];
  color?: string;
  hintPadding?: number;
  centralButton?: IConfig['centralButton'];
  autoBindContextMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoBindContextMenu: true
})

const emit = defineEmits<{
  (e: 'click', data: { icon: string; hint: string }): void;
}>();

let menuManager: Manager | null = null
let menuElement: HTMLElement | null = null

function createMenu() {
  const config: IConfig = {
    autoBindContextMenu: props.autoBindContextMenu,
    sprite: props.sprite,
    innerRadius: props.innerRadius,
    outerRadius: props.outerRadius,
    opacity: props.opacity ?? 0.7,
    iconScale: props.iconScale,
    iconRadius: props.iconRadius,
    sectors: props.sectors,
    centralButton: props.centralButton,
    color: props.color,
    hintPadding: props.hintPadding,
  }

  const tempContainer = document.createElement('div')

  menuManager = new Manager(tempContainer, config)
  menuManager.on('click', (data: any) => emit('click', data))
  menuElement = tempContainer.firstChild as HTMLElement
  tempContainer.removeChild(menuElement)

  return menuElement
}

function replaceRoot(newElement: HTMLElement) {
  const instance = getCurrentInstance()
  const oldEl = instance?.vnode.el
  const parent = oldEl?.parentNode

  if (parent && oldEl && newElement) {
    parent.replaceChild(newElement, oldEl)
    instance.vnode.el = newElement
  }
}

onMounted(() => {
  replaceRoot(createMenu())
})

onUnmounted(() => {
  if (menuElement && menuElement.parentNode) {
    menuElement.parentNode.removeChild(menuElement)
  }

  menuManager = null
})

watch(() => [
  props.sprite,
  props.innerRadius,
  props.outerRadius,
  props.opacity,
  props.iconScale,
  props.iconRadius,
  props.sectors,
  props.centralButton,
  props.color,
  props.hintPadding,
  props.autoBindContextMenu,
], () => {
  if (!menuElement) return

  const newEl = createMenu()
  replaceRoot(newEl)
  menuElement = newEl
}, { deep: true })

defineExpose({
  show: (event: PointerEvent) => menuManager?.show(event),
  hide: () => menuManager?.hide()
})
</script>
