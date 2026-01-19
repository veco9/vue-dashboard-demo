import { describe, it, expect } from 'vitest'
import { computeWidgetPositions, type GridPlacementConfig } from '@/utils/computeWidgetPositions'
import type { DashboardWidgetPartial } from '@/models/dashboardWidget'

/**
 * Helper to create a minimal widget partial for testing.
 * Only layout dimensions matter for position computation.
 */
function widget(layout: Partial<DashboardWidgetPartial['layout']>): DashboardWidgetPartial {
  return {
    layout: { w: 1, h: 1, ...layout },
    type: 'bar',
    displayName: 'Test',
    initialize: async () => ({ data: {} as never }),
  }
}

const grid4: GridPlacementConfig = { columns: 4 }

describe('computeWidgetPositions', () => {
  it('places a single widget at (0, 0)', () => {
    const result = computeWidgetPositions([widget({ w: 2, h: 3 })], grid4)

    expect(result).toHaveLength(1)
    expect(result[0].layout.x).toBe(0)
    expect(result[0].layout.y).toBe(0)
  })

  it('places two widgets side by side when they fit', () => {
    const result = computeWidgetPositions(
      [widget({ w: 2, h: 2 }), widget({ w: 2, h: 2 })],
      grid4,
    )

    expect(result[0].layout).toMatchObject({ x: 0, y: 0 })
    expect(result[1].layout).toMatchObject({ x: 2, y: 0 })
  })

  it('wraps to next row when width exceeds columns', () => {
    const result = computeWidgetPositions(
      [widget({ w: 3, h: 1 }), widget({ w: 3, h: 1 })],
      grid4,
    )

    expect(result[0].layout).toMatchObject({ x: 0, y: 0 })
    // Second widget cannot fit on row 0 (only 1 col left), goes to row 1
    expect(result[1].layout).toMatchObject({ x: 0, y: 1 })
  })

  it('clamps widget width to column count', () => {
    const result = computeWidgetPositions(
      [widget({ w: 10, h: 1 })],
      { columns: 4 },
    )

    // Widget should still be placed (findSlot clamps w to cols)
    expect(result[0].layout.x).toBe(0)
    expect(result[0].layout.y).toBe(0)
  })

  it('fills gaps left by shorter widgets', () => {
    // Row 0: [tall(2x3)] [short(2x1)]
    // Row 1: gap at x:2..3 should be filled by a 2x1 widget
    const result = computeWidgetPositions(
      [
        widget({ w: 2, h: 3 }),
        widget({ w: 2, h: 1 }),
        widget({ w: 2, h: 1 }),
      ],
      grid4,
    )

    expect(result[0].layout).toMatchObject({ x: 0, y: 0 })
    expect(result[1].layout).toMatchObject({ x: 2, y: 0 })
    // Third widget fills the gap at x:2, y:1 (column tops: [3, 3, 1, 1])
    expect(result[2].layout).toMatchObject({ x: 2, y: 1 })
  })

  it('preserves original layout properties (minW, maxH, etc.)', () => {
    const result = computeWidgetPositions(
      [widget({ w: 2, h: 2, minW: 2, maxH: 4, isResizable: false })],
      grid4,
    )

    expect(result[0].layout.minW).toBe(2)
    expect(result[0].layout.maxH).toBe(4)
    expect(result[0].layout.isResizable).toBe(false)
  })

  it('handles empty input', () => {
    const result = computeWidgetPositions([], grid4)
    expect(result).toEqual([])
  })

  it('stacks widgets vertically when all are full-width', () => {
    const result = computeWidgetPositions(
      [widget({ w: 4, h: 2 }), widget({ w: 4, h: 3 }), widget({ w: 4, h: 1 })],
      grid4,
    )

    expect(result[0].layout).toMatchObject({ x: 0, y: 0 })
    expect(result[1].layout).toMatchObject({ x: 0, y: 2 })
    expect(result[2].layout).toMatchObject({ x: 0, y: 5 })
  })
})
