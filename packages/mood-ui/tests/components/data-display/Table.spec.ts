import { describe, it, expect, vi } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import ModoProvider from '../../../src/components/ModoProvider.vue';
import Button from '../../../src/components/forms/Button.vue';
import Table from '../../../src/components/data-display/table/Table.vue';
import TablePagination from '../../../src/components/data-display/table/TablePagination.vue';

const sampleCols = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'email', header: 'Email' },
];

const sampleRows = [
    { id: 1, name: 'Kate Moore', role: 'CEO', status: 'Active', email: 'kate@acme.com' },
    { id: 2, name: 'John Smith', role: 'CTO', status: 'Active', email: 'john@acme.com' },
    { id: 3, name: 'Sara Johnson', role: 'CMO', status: 'On Leave', email: 'sara@acme.com' },
];

describe('Table', () => {
    it('does not render an always-on focus ring on the first cell at mount or on mouse click, using :focus-visible instead', async () => {
        const wrapper = mount(Table, {
            props: {
                data: sampleRows,
                columns: sampleCols,
                rowKey: 'id',
            },
        });

        const cells = wrapper.findAll('tbody td');
        expect(cells.length).toBeGreaterThan(0);

        // Roving tabindex stays intact on (0,0) for keyboard accessibility
        expect(cells[0]!.attributes('tabindex')).toBe('0');
        expect(cells[1]!.attributes('tabindex')).toBe('-1');

        // Unconditional `ring-2` must NOT be present; only `focus-visible:ring-2` + `focus-visible:outline-none` (no double border)
        expect(cells[0]!.classes()).not.toContain('ring-2');
        expect(cells[0]!.classes()).toContain('focus-visible:ring-2');
        expect(cells[0]!.classes()).toContain('focus-visible:outline-none');
        expect(cells[0]!.classes()).toContain('modo-table-cell-focus');

        // Clicking a row does not add an unconditional `ring-2` class
        await wrapper.findAll('tbody tr')[1]!.trigger('click');
        for (const td of wrapper.findAll('tbody td')) {
            expect(td.classes()).not.toContain('ring-2');
        }
    });

    it('renders smaller header typography than body cells and keeps headers free of vertical borders', () => {
        const medium = mount(Table, {
            props: {
                data: sampleRows,
                columns: sampleCols,
                rowKey: 'id',
                bordered: 'all',
            },
        });

        const th = medium.find('thead th');
        const td = medium.find('tbody td');
        expect(th.classes()).toContain('text-caption');
        expect(th.classes()).not.toContain('border-r');
        expect(td.classes()).toContain('text-body');
        expect(td.classes()).toContain('border-r');

        const small = mount(Table, {
            props: {
                data: sampleRows,
                columns: sampleCols,
                rowKey: 'id',
                size: 'small',
            },
        });
        expect(small.find('thead th').classes()).toContain('text-[11px]');
        expect(small.find('tbody td').classes()).toContain('text-caption');

        const large = mount(Table, {
            props: {
                data: sampleRows,
                columns: sampleCols,
                rowKey: 'id',
                size: 'large',
            },
        });
        expect(large.find('thead th').classes()).toContain('text-[13px]');
        expect(large.find('tbody td').classes()).toContain('text-body-lg');
    });

    it('uses the muted outer tray with inset padding and embeds pagination on the outer tray without breaking standalone TablePagination', () => {
        const wrapper = mount(Table, {
            props: {
                data: sampleRows,
                columns: sampleCols,
                rowKey: 'id',
                pagination: { page: 1, pageSize: 2, total: 3 },
            },
        });

        // Outer tray uses bg-muted and exposes concentric inner radius variable
        expect(wrapper.classes()).toContain('bg-muted');
        expect(wrapper.attributes('style')).toContain('--modo-table-inner-radius');

        // Embedded pagination sits transparently on the outer tray
        const embeddedNav = wrapper.find('nav');
        expect(embeddedNav.classes()).toContain('bg-transparent');
        expect(embeddedNav.classes()).not.toContain('bg-card');

        // Standalone TablePagination keeps its card + top-border appearance (zero breaking changes)
        const standalone = mount(TablePagination, {
            props: {
                pagination: { page: 1, pageSize: 10, total: 25 },
            },
        });
        expect(standalone.find('nav').classes()).toContain('bg-card');
        expect(standalone.find('nav').classes()).toContain('border-t');
    });

    it('uses canonical small (sm / h-9) controls by default, inherits ModoProvider color dynamically without hardcoded overrides, and avoids blue bulk-action banners', () => {
        const wrapper = mount(ModoProvider, {
            props: { color: 'primary' },
            slots: {
                default: () =>
                    h(
                        Table,
                        {
                            data: sampleRows,
                            columns: sampleCols,
                            rowKey: 'id',
                            selectable: 'multi',
                            selected: [1],
                            globalSearch: true,
                            columnVisibility: true,
                            exportable: true,
                            pagination: { page: 1, pageSize: 2, total: 3 },
                        },
                        {
                            'bulk-actions': ({ clear }: { clear: () => void }) =>
                                h(Button, { variant: 'outline', size: 'small', label: 'Clear', onClick: clear }),
                        },
                    ),
            },
        });

        // Standard `small` (`h-9`) sizing on search wrapper and toolbar/pagination controls
        expect(wrapper.find('.modo-field-wrapper').classes()).toContain('h-9');
        const colBtn = wrapper.find('button[aria-haspopup="dialog"]');
        expect(colBtn.classes()).toContain('h-9');
        // Inherits ModoProvider primary color naturally (not hardcoded neutral/black)
        expect(colBtn.classes()).toContain('text-primary');
        expect(colBtn.classes()).not.toContain('bg-background');

        // Bulk-actions renders inline without a full-width `bg-primary-subtle` banner
        const bulkRegion = wrapper.find('[role="region"].modo-table-bulk-actions');
        expect(bulkRegion.exists()).toBe(true);
        expect(bulkRegion.classes()).not.toContain('bg-primary-subtle');

        // Compact helper typography (`text-caption`) on pagination nav
        const nav = wrapper.find('nav');
        expect(nav.classes()).toContain('text-caption');
    });

    it('animates row reordering via compositor FLIP transforms when sorting changes and rotates the sort indicator', async () => {
        const animateSpy = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
        const origAnimate = HTMLElement.prototype.animate;
        HTMLElement.prototype.animate = animateSpy;

        // Stub bounding rects so rows report distinct vertical positions before & after sort
        const origRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function () {
            const parent = this.parentElement;
            const idx = parent ? Array.from(parent.children).indexOf(this) : 0;
            return {
                top: idx * 48,
                bottom: idx * 48 + 48,
                left: 0,
                right: 400,
                width: 400,
                height: 48,
                x: 0,
                y: idx * 48,
                toJSON: () => ({}),
            } as DOMRect;
        };

        try {
            const wrapper = mount(Table, {
                props: {
                    data: sampleRows,
                    columns: sampleCols,
                    rowKey: 'id',
                },
            });

            const sortableHeader = wrapper.find('thead th[role="button"]');
            expect(sortableHeader.attributes('aria-sort')).toBe('none');

            // Click once -> ascending ('John Smith', 'Kate Moore', 'Sara Johnson')
            await sortableHeader.trigger('click');
            await wrapper.vm.$nextTick();
            expect(sortableHeader.attributes('aria-sort')).toBe('ascending');
            expect(animateSpy).toHaveBeenCalled();

            // Click again -> descending ('Sara Johnson', 'Kate Moore', 'John Smith') with 180deg icon rotation
            animateSpy.mockClear();
            await sortableHeader.trigger('click');
            await wrapper.vm.$nextTick();
            expect(sortableHeader.attributes('aria-sort')).toBe('descending');
            expect(sortableHeader.html()).toContain('rotate-180');
            expect(animateSpy).toHaveBeenCalled();
        } finally {
            HTMLElement.prototype.animate = origAnimate;
            HTMLElement.prototype.getBoundingClientRect = origRect;
        }
    });

    it('responds dynamically to border-radius adjustments (both ModoProvider and prop overrides) across outer tray, concentric inner card, and embedded controls', () => {
        const providerFull = mount(ModoProvider, {
            props: { radius: 'full' },
            slots: {
                default: () =>
                    h(Table, {
                        data: sampleRows,
                        columns: sampleCols,
                        rowKey: 'id',
                        globalSearch: true,
                        columnVisibility: true,
                        pagination: { page: 1, pageSize: 2, total: 3 },
                    }),
            },
        });

        const tableRoot = providerFull.find('.modo-table-root');
        expect(tableRoot.classes()).toContain('rounded-3xl');
        expect(tableRoot.attributes('style')).toContain('--modo-table-inner-radius: 1.25rem');
        expect(providerFull.find('.modo-field-wrapper').classes()).toContain('rounded-[999px]');
        expect(providerFull.find('button[aria-haspopup="dialog"]').classes()).toContain('rounded-[999px]');

        const localNone = mount(ModoProvider, {
            props: { radius: 'large' },
            slots: {
                default: () =>
                    h(Table, {
                        data: sampleRows,
                        columns: sampleCols,
                        rowKey: 'id',
                        radius: 'none',
                        globalSearch: true,
                        pagination: { page: 1, pageSize: 2, total: 3 },
                    }),
            },
        });

        const noneRoot = localNone.find('.modo-table-root');
        expect(noneRoot.classes()).toContain('rounded-none');
        expect(noneRoot.attributes('style')).toContain('--modo-table-inner-radius: 0px');
        expect(localNone.find('.modo-field-wrapper').classes()).toContain('rounded-none');
        expect(localNone.find('nav button').classes()).toContain('rounded-none');
    });

    it('displays custom pageSize in TablePagination Select even when pageSizeOptions uses defaults', () => {
        const pager = mount(TablePagination, {
            props: {
                pagination: { page: 1, pageSize: 3, total: 6 },
            },
        });

        const selectBtn = pager.find('button[aria-label="Rows per page"], .modo-field-wrapper');
        expect(selectBtn.text()).toContain('3');
        expect(selectBtn.text()).not.toContain('Select');
    });
});
