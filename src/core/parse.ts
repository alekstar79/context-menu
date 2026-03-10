import { Fragment } from './svg'

export function removeEmptyTextNodes(node: Node): void
{
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (textNode) => {
        if (textNode.textContent?.trim() === '') {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_SKIP
      }
    }
  )

  const textNodes: Text[] = []

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach(tn => tn.remove())
}

export function parse(svgString: string): Fragment
{
  const div = document.createElement('div')

  let svg = svgString.trim()
  if (!svg.match(/^\s*<\s*svg/i)) {
    svg = '<svg>' + svg + '</svg>'
  }

  div.innerHTML = svg

  const svgElem = div.querySelector('svg')
  const frag = document.createDocumentFragment()

  if (svgElem) {
    while (svgElem.firstChild) {
      frag.appendChild(svgElem.firstChild)
    }
  }

  removeEmptyTextNodes(frag)

  return new Fragment(frag)
}
