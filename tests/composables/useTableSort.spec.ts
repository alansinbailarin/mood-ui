import { describe, it, expect } from 'vitest'; 
import { computed, ref } from 'vue'; 
import { useTableSort } from '../../src/composables/useTableSort'; 
import type { 
    NormalizedTableColumn, 
    TableSortState, 
} from '../../src/interfaces/data-display/table/Table.interface'; 
 
interface Row { 
    id: number; 
    name: string; 
    age: number | null; 
    joinedAt: string | null; 
} 
 
const cols: NormalizedTableColumn<Row>[] = [ 
    { key: 'name', label: 'Name', sortable: true, align: 'left', type: 'text' }, 
    { key: 'age', label: 'Age', sortable: true, align: 'right', type: 'number' }, 
    { key: 'joinedAt', label: 'Joined', sortable: true, align: 'left', type: 'date' }, 
    { key: 'id', label: 'ID', sortable: false, align: 'right', type: 'number' }, 
]; 
 
const rows: Row[] = [ 
    { id: 1, name: 'Charlie', age: 30, joinedAt: '2024-01-15' }, 
    { id: 2, name: 'alice', age: null, joinedAt: '2023-06-01' }, 
    { id: 3, name: 'Bob', age: 25, joinedAt: null }, 
    { id: 4, name: 'Émile', age: 40, joinedAt: '2025-03-10' }, 
]; 
 
function makeSort(initial: TableSortState = []) { 
    return useTableSort<Row>({ 
        columns: computed(() => cols), 
        initial, 
        multi: () => false, 
        clearable: () => true, 
    }); 
} 
 
describe('useTableSort · single-column', () => { 
    it('cycles asc → desc → none on repeated toggles', () => { 
        const s = makeSort(); 
        s.toggle('name', false); 
        expect(s.sort.value).toEqual([{ key: 'name', direction: 'asc' }]); 
        s.toggle('name', false); 
        expect(s.sort.value).toEqual([{ key: 'name', direction: 'desc' }]); 
        s.toggle('name', false); 
        expect(s.sort.value).toEqual([]); 
    }); 
 
    it('replaces sort when toggling another column', () => { 
        const s = makeSort(); 
        s.toggle('name', false); 
        s.toggle('age', false); 
        expect(s.sort.value).toEqual([{ key: 'age', direction: 'asc' }]); 
    }); 
 
    it('apply() sorts strings via localeCompare (case-insensitive, accent-aware)', () => { 
        const s = makeSort([{ key: 'name', direction: 'asc' }]); 
        const out = s.apply(rows).map((r) => r.name); 
        expect(out).toEqual(['alice', 'Bob', 'Charlie', 'Émile']); 
    }); 
 
    it('apply() pushes nulls to the end regardless of direction', () => { 
        const sAsc = makeSort([{ key: 'age', direction: 'asc' }]); 
        const ascOut = sAsc.apply(rows).map((r) => r.age); 
        expect(ascOut).toEqual([25, 30, 40, null]); 
 
        const sDesc = makeSort([{ key: 'age', direction: 'desc' }]); 
        const descOut = sDesc.apply(rows).map((r) => r.age); 
        expect(descOut).toEqual([40, 30, 25, null]); 
    }); 
 
    it('apply() preserves order when sort is empty', () => { 
        const s = makeSort(); 
        const out = s.apply(rows); 
        expect(out).toEqual(rows); 
    }); 
 
    it('ariaSortFor returns proper WAI-ARIA values', () => { 
        const s = makeSort([{ key: 'name', direction: 'asc' }]); 
        expect(s.ariaSortFor(cols[0])).toBe('ascending'); 
        expect(s.ariaSortFor(cols[1])).toBe('none'); 
        // Non-sortable column → undefined. 
        expect(s.ariaSortFor(cols[3])).toBeUndefined(); 
    }); 
}); 
 
describe('useTableSort · multi-column', () => { 
    function makeMulti(initial: TableSortState = []) { 
        return useTableSort<Row>({ 
            columns: computed(() => cols), 
            initial, 
            multi: () => true, 
            clearable: () => true, 
        }); 
    } 
 
    it('shift+click appends a criterion at the end', () => { 
        const s = makeMulti(); 
        s.toggle('name', false); // [name asc] 
        s.toggle('age', true); // [name asc, age asc] 
        expect(s.sort.value).toEqual([ 
            { key: 'name', direction: 'asc' }, 
            { key: 'age', direction: 'asc' }, 
        ]); 
        expect(s.priorityFor('name')).toBe(1); 
        expect(s.priorityFor('age')).toBe(2); 
    }); 
 
    it('plain click still replaces the whole sort even in multi mode', () => { 
        const s = makeMulti([ 
            { key: 'name', direction: 'asc' }, 
            { key: 'age', direction: 'asc' }, 
        ]); 
        s.toggle('joinedAt', false); 
        expect(s.sort.value).toEqual([{ key: 'joinedAt', direction: 'asc' }]); 
    }); 
 
    it('shift+cycling preserves priority of other criteria when one is removed', () => { 
        const s = makeMulti(); 
        s.toggle('name', false); // [name asc] 
        s.toggle('age', true); // [name asc, age asc] 
        s.toggle('age', true); // [name asc, age desc] 
        s.toggle('age', true); // [name asc] — age cleared 
        expect(s.sort.value).toEqual([{ key: 'name', direction: 'asc' }]); 
    }); 
 
    it('apply() falls back to the next criterion on ties', () => { 
        const tied: Row[] = [ 
            { id: 1, name: 'A', age: 10, joinedAt: null }, 
            { id: 2, name: 'A', age: 5, joinedAt: null }, 
            { id: 3, name: 'B', age: 1, joinedAt: null }, 
        ]; 
        const s = makeMulti([ 
            { key: 'name', direction: 'asc' }, 
            { key: 'age', direction: 'asc' }, 
        ]); 
        const out = s.apply(tied).map((r) => r.id); 
        expect(out).toEqual([2, 1, 3]); 
    }); 
}); 
 
describe('useTableSort · controlled mode', () => { 
    it('emits via onUpdate and reads back from state()', () => { 
        const ext = ref<TableSortState>([]); 
        const s = useTableSort<Row>({ 
            columns: computed(() => cols), 
            state: () => ext.value, 
            onUpdate: (next) => { ext.value = next; }, 
            multi: () => false, 
            clearable: () => true, 
        }); 
        s.toggle('age', false); 
        expect(ext.value).toEqual([{ key: 'age', direction: 'asc' }]); 
        expect(s.sort.value).toEqual([{ key: 'age', direction: 'asc' }]); 
    }); 
});
