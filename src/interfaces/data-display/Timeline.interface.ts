import type { Component } from 'vue';

export interface TimelineItem {
    /** Unique identifier. */
    id: string | number;
    /** Title shown in the heading line. */
    title: string;
    /** Optional secondary description. */
    description?: string;
    /** Optional timestamp / date label. */
    timestamp?: string;
    /** Optional custom icon shown inside the marker. */
    icon?: Component;
    /** Override the marker color for this item. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Visual marker variant for this item. */
    variant?: 'dot' | 'icon' | 'outline';
}

export interface Timeline {
    /** Items to render in order. */
    items: TimelineItem[];
    /** Default semantic color (overridable per item). */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Side of the marker rail. */
    side?: 'left' | 'right';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Default marker variant for items that don't override. */
    variant?: 'dot' | 'icon' | 'outline';
}
