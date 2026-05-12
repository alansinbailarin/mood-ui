import { reactive } from 'vue'; 
import type { ConfirmInput, ConfirmRequest } from '../interfaces/feedback/ConfirmDialog.interface'; 
 
/** 
 * Imperative confirmation dialogs. Mount one `<ConfirmDialog />` near the 
 * root of your app and then call `useConfirm().confirm({...})` from any 
 * component to obtain a `Promise<boolean>` (resolves `true` on confirm, 
 * `false` on cancel/dismiss). 
 * 
 * Calls are serialized: a second `confirm()` while one is open is queued 
 * and shown when the first resolves. 
 */ 
 
interface ConfirmStore { 
    queue: ConfirmRequest[]; 
} 
 
const store = reactive<ConfirmStore>({ queue: [] }); 
 
let _idCounter = 0; 
function nextId(): string { 
    _idCounter += 1; 
    return `confirm-${Date.now()}-${_idCounter}`; 
} 
 
function confirm(input: ConfirmInput | string = {}): Promise<boolean> { 
    const normalized: ConfirmInput = 
        typeof input === 'string' ? { title: input } : input; 
 
    return new Promise<boolean>((resolve) => { 
        const req: ConfirmRequest = { 
            ...normalized, 
            id: nextId(), 
            resolve, 
        }; 
        store.queue.push(req); 
    }); 
} 
 
/** 
 * Resolve and pop the head of the queue. Used by `<ConfirmDialog>` when 
 * the user clicks confirm/cancel or dismisses via overlay/Escape. 
 */ 
function resolveCurrent(value: boolean): void { 
    const head = store.queue[0]; 
    if (!head) return; 
    head.resolve(value); 
    store.queue.shift(); 
} 
 
export function useConfirmQueue(): ConfirmStore {
    return store;
} 
 
export function useConfirm() { 
    return { confirm, resolveCurrent }; 
}
