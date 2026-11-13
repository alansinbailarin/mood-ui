import type { ModoColor, ModoSize } from '../../config/ModoConfig'

export interface ModeOrbProps {
  /**
   * When true, anchors the orb fixed to the bottom-right corner of the viewport.
   * Defaults to `false` so it flows inline in toolbars, headers, or Showroom playgrounds.
   * @default false
   */
  fixed?: boolean

  /**
   * Size of the orb. Its diameter matches the control height of the shared
   * size scale (32 / 36 / 40 / 48 px). Inherits from `ModoProvider`.
   */
  size?: ModoSize

  /**
   * Sphere color. Follows the provider: `default` paints the sphere with the
   * provider's primary palette; a semantic color (`danger`, `success`…) uses
   * that token instead.
   */
  color?: ModoColor

  /**
   * Disables the toggle.
   * @default false
   */
  disabled?: boolean

  /**
   * Accessible label for the color mode toggle button.
   * Falls back to the provider locale (`modeOrb.toggle`).
   */
  ariaLabel?: string
}
