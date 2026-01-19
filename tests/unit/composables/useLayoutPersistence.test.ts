import { describe, it, expect, beforeEach } from 'vitest'
import { useLayoutPersistence } from '@/composables/useLayoutPersistence'
import type { LayoutItem } from '@/models/layoutItem'

const STORAGE_KEY = 'dashboard-layout-v2'

function makeLayout(overrides?: Partial<LayoutItem>): LayoutItem {
  return {
    i: '0',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
    minW: 2,
    maxW: 6,
    ...overrides,
  } as LayoutItem
}

describe('useLayoutPersistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is stored', () => {
    const { loadLayout } = useLayoutPersistence()
    expect(loadLayout()).toBeNull()
  })

  it('round-trips a layout through save and load', () => {
    const { saveLayout, loadLayout } = useLayoutPersistence()

    const layouts = { lg: [makeLayout({ i: '1', x: 0 }), makeLayout({ i: '2', x: 3 })] }
    saveLayout(layouts, 'lg', ['1', '2'], ['100'])

    const loaded = loadLayout()
    expect(loaded).not.toBeNull()
    expect(loaded!.designBreakpoint).toBe('lg')
    expect(loaded!.dashboardWidgetIds).toEqual(['1', '2'])
    expect(loaded!.paletteWidgetIds).toEqual(['100'])
    expect(loaded!.breakpointLayouts.lg).toHaveLength(2)
    expect(loaded!.breakpointLayouts.lg[0].i).toBe('1')
  })

  it('serializes layout items with all relevant properties', () => {
    const { saveLayout, loadLayout } = useLayoutPersistence()

    const item = makeLayout({
      i: '1',
      minH: 2,
      maxH: 8,
      isResizable: false,
      preventResizeH: true,
      preventResizeW: false,
    })
    saveLayout({ lg: [item] }, 'lg', ['1'], [])

    const loaded = loadLayout()!
    const savedItem = loaded.breakpointLayouts.lg[0]
    expect(savedItem.minH).toBe(2)
    expect(savedItem.maxH).toBe(8)
    expect(savedItem.isResizable).toBe(false)
    expect(savedItem.preventResizeH).toBe(true)
    expect(savedItem.preventResizeW).toBe(false)
  })

  it('migrates v1 format (single gridLayout) by returning null and clearing storage', () => {
    // v1 format had a `gridLayout` key instead of `breakpointLayouts`
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      gridLayout: [{ i: '0', x: 0, y: 0, w: 3, h: 2 }],
      dashboardWidgetIds: ['0'],
      paletteWidgetIds: [],
    }))

    const { loadLayout } = useLayoutPersistence()
    expect(loadLayout()).toBeNull()
    // Storage should be cleared after migration
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('returns null for corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{')

    const { loadLayout } = useLayoutPersistence()
    expect(loadLayout()).toBeNull()
  })

  it('clearLayout removes stored data', () => {
    const { saveLayout, clearLayout, hasStoredLayout } = useLayoutPersistence()

    saveLayout({ lg: [makeLayout()] }, 'lg', ['1'], [])
    expect(hasStoredLayout()).toBe(true)

    clearLayout()
    expect(hasStoredLayout()).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('hasStoredLayout returns false when empty', () => {
    const { hasStoredLayout } = useLayoutPersistence()
    expect(hasStoredLayout()).toBe(false)
  })

  it('saves multiple breakpoint layouts', () => {
    const { saveLayout, loadLayout } = useLayoutPersistence()

    const layouts = {
      lg: [makeLayout({ i: '1', w: 4 })],
      sm: [makeLayout({ i: '1', w: 6 })],
    }
    saveLayout(layouts, 'lg', ['1'], [])

    const loaded = loadLayout()!
    expect(Object.keys(loaded.breakpointLayouts)).toEqual(['lg', 'sm'])
    expect(loaded.breakpointLayouts.sm[0].w).toBe(6)
  })
})
