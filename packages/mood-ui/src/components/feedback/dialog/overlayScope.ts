import { inject } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ModoColor, ModoRadius, ModoSize } from '../../../config/ModoConfig'

/**
 * Values a Dialog/Sheet content panel resolves once and shares with the
 * parts rendered inside it (Icon, Close), so a `color` / `size` / `radius`
 * set on the panel reaches every inner part like it does on natives.
 */
export interface OverlayScopeValue {
  color: ComputedRef<ModoColor>
  size: ComputedRef<ModoSize>
  radius: () => ModoRadius | undefined
}

export const OVERLAY_SCOPE_KEY: InjectionKey<OverlayScopeValue> = Symbol('ModoOverlayScope')

export function useOverlayScope(): OverlayScopeValue | null {
  return inject(OVERLAY_SCOPE_KEY, null)
}

/** ModoColor → CSS color token (same mapping natives use for their accent). */
export const COLOR_TOKEN_BY_COLOR: Record<ModoColor, string> = {
  default: 'var(--foreground)',
  primary: 'var(--primary)',
  danger: 'var(--destructive)',
  success: 'var(--success)',
  warning: 'var(--warning)',
}
