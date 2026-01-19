import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useWidgetManager } from '@/composables/useWidgetManager'
import type { DashboardWidget, WidgetPeriod } from '@/models/dashboardWidget'
import type { LayoutItem } from '@/models/layoutItem'

function makeWidget(id: string, initFn?: DashboardWidget['initialize']): DashboardWidget {
  return {
    layout: { i: id, x: 0, y: 0, w: 3, h: 2 } as LayoutItem,
    type: 'bar',
    displayName: `Widget ${id}`,
    initialize: initFn ?? (async () => ({
      header: { title: `Widget ${id}` },
      data: { type: 'bar' as const, data: [], series: [] },
      footer: 'Test footer',
    })),
  }
}

function createManager(widgets: DashboardWidget[] = []) {
  const widgetItems = ref(widgets)
  const paletteWidgets = ref<DashboardWidget[]>([])
  const globalPeriod = ref<WidgetPeriod>({
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-12-31'),
  })
  const gridLayout = ref(widgets.map(w => w.layout))

  return {
    ...useWidgetManager({ gridLayout, widgetItems, paletteWidgets, globalPeriod }),
    widgetItems,
    paletteWidgets,
    gridLayout,
    globalPeriod,
  }
}

describe('useWidgetManager', () => {
  describe('initializeWidget', () => {
    it('sets loading true then stores data on success', async () => {
      const widget = makeWidget('1')
      const mgr = createManager([widget])

      await mgr.initializeWidget(widget)

      expect(mgr.isWidgetLoading(widget.layout)).toBe(false)
      expect(mgr.getWidgetData('1')).toEqual({ type: 'bar', data: [], series: [] })
      expect(mgr.getWidgetHeader('1')).toEqual({ title: 'Widget 1' })
      expect(mgr.getWidgetFooter('1')).toBe('Test footer')
    })

    it('stores error message on rejection', async () => {
      const widget = makeWidget('1', async () => {
        throw new Error('Network failure')
      })
      const mgr = createManager([widget])

      await mgr.initializeWidget(widget)

      expect(mgr.isWidgetLoading(widget.layout)).toBe(false)
      expect(mgr.getWidgetError('1')).toBe('Network failure')
      expect(mgr.getWidgetData('1')).toBeUndefined()
    })

    it('passes period and params to widget.initialize()', async () => {
      const initSpy = vi.fn(async () => ({
        data: { type: 'bar' as const, data: [], series: [] },
      }))
      const widget = makeWidget('1', initSpy)
      const mgr = createManager([widget])

      mgr.setWidgetParam('1', { filter: 'active' })
      await mgr.initializeWidget(widget)

      expect(initSpy).toHaveBeenCalledOnce()
      const callArgs = (initSpy.mock.calls as unknown as Record<string, unknown>[][])[0][0]
      expect(callArgs.period).toEqual({
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31'),
      })
      expect(callArgs.params).toEqual({ filter: 'active' })
      expect(callArgs.callbacks).toBeDefined()
    })
  })

  describe('initializeWidgets', () => {
    it('initializes all widgets in parallel', async () => {
      const w1 = makeWidget('1')
      const w2 = makeWidget('2')
      const mgr = createManager([w1, w2])

      await mgr.initializeWidgets()

      expect(mgr.getWidgetData('1')).toBeDefined()
      expect(mgr.getWidgetData('2')).toBeDefined()
    })

    it('one failure does not block others', async () => {
      const w1 = makeWidget('1', async () => {
        throw new Error('fail')
      })
      const w2 = makeWidget('2')
      const mgr = createManager([w1, w2])

      await mgr.initializeWidgets()

      expect(mgr.getWidgetError('1')).toBe('fail')
      expect(mgr.getWidgetData('2')).toBeDefined()
      expect(mgr.getWidgetError('2')).toBeNull()
    })
  })

  describe('state accessors', () => {
    it('returns correct values after initialization', async () => {
      const widget = makeWidget('1')
      const mgr = createManager([widget])

      await mgr.initializeWidget(widget)

      expect(mgr.getWidgetHeader('1')).toEqual({ title: 'Widget 1' })
      expect(mgr.getWidgetData('1')).toEqual({ type: 'bar', data: [], series: [] })
      expect(mgr.getWidgetFooter('1')).toBe('Test footer')
      expect(mgr.getWidgetError('1')).toBeNull()
    })

    it('isWidgetLoading returns true before init completes', () => {
      const widget = makeWidget('1')
      const mgr = createManager([widget])

      // Before any initialization, getRuntime creates entry with loading: true
      expect(mgr.isWidgetLoading(widget.layout)).toBe(true)
    })

    it('getWidgetError returns null on success', async () => {
      const widget = makeWidget('1')
      const mgr = createManager([widget])

      await mgr.initializeWidget(widget)

      expect(mgr.getWidgetError('1')).toBeNull()
    })
  })

  describe('removeExcessWidgets', () => {
    it('removes widgets not in new layout and returns them to palette', async () => {
      const w1 = makeWidget('1')
      const w2 = makeWidget('2')
      const mgr = createManager([w1, w2])

      await mgr.initializeWidgets()

      // New layout only contains widget 1
      await mgr.removeExcessWidgets([{ i: '1', x: 0, y: 0, w: 3, h: 2 } as LayoutItem])

      expect(mgr.widgetItems.value).toHaveLength(1)
      expect(mgr.widgetItems.value[0].layout.i).toBe('1')
      expect(mgr.paletteWidgets.value).toHaveLength(1)
      expect(mgr.paletteWidgets.value[0].layout.i).toBe('2')
    })
  })

  describe('addAdditionalWidgets', () => {
    it('moves widgets from palette to dashboard', async () => {
      const w1 = makeWidget('1')
      const w2 = makeWidget('2')
      const mgr = createManager([w1])
      mgr.paletteWidgets.value = [w2]

      // New layout includes widget 2
      const newLayout = [
        { i: '1', x: 0, y: 0, w: 3, h: 2 } as LayoutItem,
        { i: '2', x: 3, y: 0, w: 3, h: 2 } as LayoutItem,
      ]
      await mgr.addAdditionalWidgets(newLayout)

      expect(mgr.widgetItems.value).toHaveLength(2)
      expect(mgr.paletteWidgets.value).toHaveLength(0)
    })
  })

  describe('params', () => {
    it('setWidgetParam stores and merges params', () => {
      const mgr = createManager([makeWidget('1')])

      mgr.setWidgetParam('1', { filter: 'active' })
      expect(mgr.getWidgetParams('1')).toEqual({ filter: 'active' })

      mgr.setWidgetParam('1', { sort: 'desc' })
      expect(mgr.getWidgetParams('1')).toEqual({ filter: 'active', sort: 'desc' })
    })

    it('getWidgetParams returns undefined for unknown widget', () => {
      const mgr = createManager([])
      expect(mgr.getWidgetParams('unknown')).toBeUndefined()
    })
  })
})
