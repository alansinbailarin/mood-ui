import { reactive } from 'vue'; 
import type { ToastEntry, ToastInput } from '../interfaces/feedback/Toast.interface'; 
 
/** 
 * `useToast()` exposes an imperative API to push toasts onto the global 
 * queue. The actual rendering happens in `<ToastContainer>`, which must 
 * be mounted once near the root of the app. 
 * 
 * The store is module-scoped so any component can call `push()` and the 
 * toast appears in the (single) container. Mounting more than one 
 * container is allowed — both will render the same queue. 
 */ 
 
/* ------------------------------------------------------------------ */ 
/*  Module-scoped store                                                 */ 
/* ------------------------------------------------------------------ */ 
 
interface ToastStore { 
    queue: ToastEntry[]; 
} 
 
const store = reactive<ToastStore>({ queue: [] }); 
 
let _idCounter = 0; 
function nextId(): string { 
    _idCounter += 1; 
    return `toast-${Date.now()}-${_idCounter}`; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Public API                                                          */ 
/* ------------------------------------------------------------------ */ 
 
/** 
 * Push a new toast onto the queue. Returns the resolved id so callers 
 * can later `dismiss(id)` or `update(id, …)` the same toast. 
 * 
 * If `input.id` matches an existing toast, the existing entry is replaced 
 * in place (useful for live status updates: "Saving…" → "Saved"). 
 */ 
function push(input: ToastInput | string): string | number { 
    const normalized: ToastInput = typeof input === 'string' ? { title: input } : input; 
    const entry: ToastEntry = { 
        id: normalized.id ?? nextId(), 
        title: normalized.title, 
        description: normalized.description, 
        color: normalized.color ?? 'info', 
        variant: normalized.variant ?? 'subtle', 
        icon: normalized.icon, 
        hideIcon: normalized.hideIcon ?? false, 
        action: normalized.action, 
        radius: normalized.radius, 
        placement: normalized.placement, 
        duration: normalized.duration ?? 4500, 
        dismissable: normalized.dismissable ?? true, 
        pauseOnHover: normalized.pauseOnHover ?? true, 
        pushedAt: Date.now(), 
    }; 
 
    const idx = store.queue.findIndex((t) => t.id === entry.id); 
    if (idx !== -1) { 
        // Replace in place (preserve position in the stack). 
        store.queue.splice(idx, 1, entry); 
    } else { 
        store.queue.push(entry); 
    } 
    return entry.id; 
} 
 
/** Dismiss a single toast by id. No-op if the id isn't in the queue. */ 
function dismiss(id: string | number): void { 
    const idx = store.queue.findIndex((t) => t.id === id); 
    if (idx !== -1) store.queue.splice(idx, 1); 
} 
 
/** Dismiss every toast in the queue. */ 
function dismissAll(): void { 
    store.queue.splice(0, store.queue.length); 
} 
 
/** Convenience wrappers — same shape as `push()` but pre-set `color`. */ 
function info(input: Omit<ToastInput, 'color'> | string) { 
    return push(typeof input === 'string' ? { title: input, color: 'info' } : { ...input, color: 'info' }); 
} 
function success(input: Omit<ToastInput, 'color'> | string) { 
    return push(typeof input === 'string' ? { title: input, color: 'success' } : { ...input, color: 'success' }); 
} 
function warning(input: Omit<ToastInput, 'color'> | string) { 
    return push(typeof input === 'string' ? { title: input, color: 'warning' } : { ...input, color: 'warning' }); 
} 
function danger(input: Omit<ToastInput, 'color'> | string) { 
    return push(typeof input === 'string' ? { title: input, color: 'danger' } : { ...input, color: 'danger' }); 
} 
 
/** 
 * Components that render the queue (i.e. `<ToastContainer>`) call this 
 * to obtain the reactive store. The queue is conceptually owned by the 
 * composable; the container is the only consumer that mutates it (via 
 * `dismiss(id)`), and it does so through the public API. 
 */ 
export function useToastQueue(): ToastStore {
    return store;
} 
 
/** 
 * Public composable. Returns the imperative API. Stable identity — the 
 * returned object can safely be destructured at module scope. 
 */ 
export function useToast() { 
    return { push, dismiss, dismissAll, info, success, warning, danger }; 
}
