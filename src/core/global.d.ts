import * as svgModule from './index';

declare global {
  namespace Svg {
    type Element = svgModule.Element;
    type Paper = svgModule.Paper;
    type Fragment = svgModule.Fragment;
    type Matrix = svgModule.Matrix;

    interface BBox {
      x: number;
      y: number;
      width: number;
      height: number;
      cx: number;
      cy: number;
      x2: number;
      y2: number;
    }

    interface Set extends Array<svgModule.Element> {}
  }

  function Svg(el: SVGSVGElement): svgModule.Paper;
  function Svg(query: string): svgModule.Paper | null;
  function Svg(arg: any): any;

  function parse(svg: string): svgModule.Fragment;

  function animate(
    from: number | number[],
    to: number | number[],
    setter: (val: any) => void,
    duration: number,
    easing?: (n: number) => number,
    callback?: () => void
  ): { stop(): void };

  namespace mina {
    function linear(n: number): number;
    function easeinout(n: number): number;
    function elastic(n: number): number;
  }
}
