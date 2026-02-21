export interface IConfig {
  sectors: ISector[];
  sprite: string;
  innerRadius: number;
  outerRadius: number;
  opacity: number;
  iconScale?: number;
  iconRadius?: number;
  color?: string;
  hintPadding?: number;
  centralButton?: ICentralButton;
  autoBindContextMenu?: boolean;
  zIndex?: number;
}

export interface ICentralButton {
  icon: string;
  hint?: string;
  onclick?: () => void;
  iconRadius?: number;
  iconScale?: number;
  hintPosition?: 'top' | 'bottom';
  hintSpan?: number;
  hintDistance?: number;
  hintOffset?: number;
  hintStartAngle?: number;
  hintEndAngle?: number;
  hintPadding?: number;
  hintVerticalOffset?: number;
}

export interface ISector {
  icon: string;
  hint: string;
  onclick?: () => void;
  rotate?: number;
  iconScale?: number;
  iconRadius?: number;
  hintPadding?: number;
  hintVerticalOffset?: number;
}

const defaultConfig: IConfig = {
  sectors: [],
  sprite: '../icons.svg',
  innerRadius: 50,
  outerRadius: 150,
  opacity: 0.7,
}

export function defineConfig(options: Partial<IConfig>): IConfig
{
  return { ...defaultConfig, ...options }
}
