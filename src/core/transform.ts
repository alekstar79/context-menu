import { Matrix } from './matrix'

export const rad = (deg: number): number => (deg % 360) * Math.PI / 180

const p2s = /,?([a-z]),?/gi

function pathToString(this: any[]): string {
  return this.join(',').replace(p2s, '$1')
}

export const parseTransformString = (TString: string): any[] | null => {
  if (!TString) return null
  let data: any[] = []

  if (Array.isArray(TString) && Array.isArray(TString[0])) {
    data = TString.map(arr => [...arr])
  }
  if (!data.length) {
    String(TString).replace(/([rstm])\s*,?\s*((-?\d*\.?\d*(?:e[\-+]?\d+)?\s*,?\s*)+)/ig, (_a: string, b: string, c: string) => {
      const params: number[] = []

      c.replace(/(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/ig, (_: string, b: string) => {
        b && params.push(+b)
        return ''
      })

      data.push([b, ...params] as any[])
      return ''
    })
  }

  data.toString = pathToString

  return data;
}

// noinspection JSUnusedGlobalSymbols
export const svgTransform2string = (tstr: string): any[] => {
  const res: any[] = []

  tstr.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, (all: string, name: string, params: string) => {
    let paramList = params.split(/\s*,\s*|\s+/)

    if (name === 'rotate' && paramList.length === 1) paramList.push('0', '0')
    if (name === 'scale' && paramList.length === 1) paramList.push(paramList[0]);
    if (name === 'skewX') {
      res.push(['m', 1, 0, Math.tan(rad(parseFloat(paramList[0]))), 1, 0, 0] as any[])
    } else if (name === 'skewY') {
      res.push(['m', 1, Math.tan(rad(parseFloat(paramList[0]))), 0, 1, 0, 0] as any[])
    } else {
      res.push([name.charAt(0), ...paramList.map(Number)] as any[])
    }

    return all
  })

  return res
}

export const transform2matrix = (tstr: string): Matrix => {
  const tdata = parseTransformString(tstr)
  const m = new Matrix()

  if (tdata) {
    for (let i = 0, ii = tdata.length; i < ii; i++) {
      const t = tdata[i]

      switch (t[0].toLowerCase()) {
        case 't':
          m.translate(t[1], t[2] || 0)
          break
        case 'r':
          m.rotate(t[1], t[2] || 0, t[3] || 0)
          break
        case 's':
          m.scale(t[1] || 1, t[2] || t[1] || 1, t[3] || 0, t[4] || 0)
          break
        case 'm':
          m.add(t[1] || 1, t[2] || 0, t[3] || 0, t[4] || 1, t[5] || 0, t[6] || 0)
          break
      }
    }
  }

  return m
}
