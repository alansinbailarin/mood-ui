export interface FormField { 
    /** Visible label text. Skipped if both `label` and `#label` slot are absent. */ 
    label?: string; 
    /** Optional helper text shown below the control. Hidden when `errorText` is set. */ 
    helperText?: string; 
    /** Error text. When present the field announces `aria-invalid` and uses the danger color. */ 
    errorText?: string; 
    /** Adds the red asterisk and `aria-required` on the control. */ 
    required?: boolean; 
    /** Marks the control as disabled — purely visual (`for` label still wired). */ 
    disabled?: boolean; 
    /** 
     * Explicit id wired between label and control. If omitted, a unique id is 
     * generated and exposed via the default slot for the consumer to bind. 
     */ 
    id?: string; 
    /** 
     * Layout orientation. `vertical` stacks label/control/helper; `horizontal` 
     * places the label on the left and the control on the right. 
     * @default 'vertical' 
     */ 
    orientation?: 'vertical' | 'horizontal'; 
    /** 
     * Width of the label column when `orientation="horizontal"` (CSS length). 
     * @default '10rem' 
     */ 
    labelWidth?: string; 
    /** Apply `w-full` to the wrapper. */ 
    fullWidth?: boolean; 
    /** 
     * Right-aligned hint shown next to the label (e.g. `'Optional'`, `'1/4'`). 
     * Decorative — not announced to screen readers. 
     */ 
    hint?: string; 
    /** Tag rendered for the wrapper. @default 'div' */ 
    as?: string; 
} 
 
/** 
 * Slot bindings exposed by `<FormField>`'s default slot. Spread these onto 
 * the inner control to wire label/aria automatically. 
 */ 
export interface FormFieldSlotProps { 
    /** Id wired to the rendered `<label for>`. Pass to the control's `id` prop. */ 
    id: string; 
    /** ARIA-describedby string with helper/error ids. May be `undefined`. */ 
    describedBy: string | undefined; 
    /** Mirrors `errorText`-driven invalid state. */ 
    invalid: boolean; 
    /** Mirrors `disabled`. */ 
    disabled: boolean; 
    /** Mirrors `required`. */ 
    required: boolean; 
    /** Convenience: `'danger'` if invalid, `undefined` otherwise. Pass to a `color` prop. */ 
    color: 'danger' | undefined; 
}
