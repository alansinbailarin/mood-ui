import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

export interface Stat {
    /** Short label (e.g. "Revenue"). */
    label: string;
    /** Main metric value. Pre-formatted by the consumer. */
    value: string | number;
    /** Optional helper text shown below the value. */
    description?: string;
    /** Optional leading icon. */
    icon?: Component;
    /** Trend metadata. Renders an arrow + delta. */
    trend?: {
        /** Numeric delta (positive or negative). */
        value: number;
        /** Optional formatted display value. Defaults to `${value}%`. */
        label?: string;
        /** Override the auto direction (positive → up, negative → down). */
        direction?: 'up' | 'down' | 'neutral';
    };
    /** Visual variant for the card. */
    variant?: 'plain' | 'outlined' | 'filled';
    /** Semantic color family for the icon and trend. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: ModoSize;
    /** Show a decorative loading skeleton instead of the value. */
    loading?: boolean;
}
