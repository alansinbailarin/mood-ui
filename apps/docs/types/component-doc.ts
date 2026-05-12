/**
 * Types for ComponentDoc / DocPage / ComponentPreview.
 *
 * Migrated from src/showroom/types.ts. Only the doc-related types live
 * here — NavEntry / NavCategory now live in utils/nav-manifest.ts and
 * ControlDef belonged to the legacy playground which we're not porting.
 */
export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

export interface EmitDoc {
  name: string;
  payload: string;
  description?: string;
}

export interface SlotDoc {
  name: string;
  description?: string;
  /** Slot props (scoped slot bindings). */
  bindings?: string;
}
