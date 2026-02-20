import { Fragment } from './svg';

export function parse(svgString: string): Fragment {
  const div = document.createElement('div');
  let svg = svgString.trim();
  if (!svg.match(/^\s*<\s*svg/i)) {
    svg = '<svg>' + svg + '</svg>';
  }
  div.innerHTML = svg;
  const svgElem = div.querySelector('svg');
  const frag = document.createDocumentFragment();
  if (svgElem) {
    while (svgElem.firstChild) {
      frag.appendChild(svgElem.firstChild);
    }
  }
  return new Fragment(frag);
}
