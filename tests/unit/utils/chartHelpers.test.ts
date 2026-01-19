import { describe, it, expect } from 'vitest'
import {
  toSafeKey,
  createKeyMapping,
  getUniqueSeriesNames,
  mapCategoriesToIndex,
  formatCompareKey,
  pickSeriesColor,
  findSeriesIndex,
  pickSplitStackColor,
} from '@/utils/chartHelpers'

describe('toSafeKey', () => {
  it('replaces spaces with underscores', () => {
    expect(toSafeKey('Hello World')).toBe('Hello_World')
  })

  it('removes brackets and special characters', () => {
    expect(toSafeKey('Revenue ($)')).toBe('Revenue_')
  })

  it('preserves accented characters', () => {
    expect(toSafeKey('Résumé')).toBe('Résumé')
  })

  it('handles empty string', () => {
    expect(toSafeKey('')).toBe('')
  })

  it('collapses multiple spaces', () => {
    expect(toSafeKey('a   b')).toBe('a_b')
  })
})

describe('createKeyMapping', () => {
  it('maps labels to safe keys', () => {
    const result = createKeyMapping(['Revenue ($)', 'Net MRR'])
    expect(result).toEqual({
      'Revenue ($)': 'Revenue_',
      'Net MRR': 'Net_MRR',
    })
  })

  it('returns empty object for empty input', () => {
    expect(createKeyMapping([])).toEqual({})
  })
})

describe('formatCompareKey', () => {
  it('appends comparison suffix using i18n key', () => {
    // Setup mock returns key as-is, so t("widget.comparison") = "widget.comparison"
    expect(formatCompareKey('Revenue')).toBe('Revenue (widget.comparison)')
  })
})

describe('getUniqueSeriesNames', () => {
  it('extracts unique value labels', () => {
    const data = [
      { values: [{ valueLabel: 'A', value: 1 }, { valueLabel: 'B', value: 2 }] },
      { values: [{ valueLabel: 'B', value: 3 }, { valueLabel: 'C', value: 4 }] },
    ]
    expect(getUniqueSeriesNames(data)).toEqual(['A', 'B', 'C'])
  })

  it('handles missing values gracefully', () => {
    const data = [{ values: undefined }, {}] as { values?: { valueLabel: string; value: number }[] }[]
    expect(getUniqueSeriesNames(data)).toEqual([])
  })
})

describe('mapCategoriesToIndex', () => {
  it('maps xLabel to array index', () => {
    const data = [
      { xLabel: 'Jan' },
      { xLabel: 'Feb' },
      { xLabel: 'Mar' },
    ]
    expect(mapCategoriesToIndex(data)).toEqual({ Jan: 0, Feb: 1, Mar: 2 })
  })

  it('handles empty array', () => {
    expect(mapCategoriesToIndex([])).toEqual({})
  })
})

describe('pickSeriesColor', () => {
  it('returns light color for compare series', () => {
    const color = pickSeriesColor(0, true)
    // Light palette index 0 = '#C9B8E5'
    expect(color).toBe('#C9B8E5')
  })

  it('returns all-palette color for primary series', () => {
    const color = pickSeriesColor(0, false)
    // All palette index 0 = '#6F42C1'
    expect(color).toBe('#6F42C1')
  })

  it('uses main palette in paired mode', () => {
    const color = pickSeriesColor(1, false, true)
    // Main palette index 1 = '#007BFF'
    expect(color).toBe('#007BFF')
  })

  it('wraps around palette on overflow', () => {
    const color = pickSeriesColor(7, true)
    // 7 % 7 = 0, light palette[0] = '#C9B8E5'
    expect(color).toBe('#C9B8E5')
  })
})

describe('pickSplitStackColor', () => {
  it('returns light color for top, dark for bottom', () => {
    const top = pickSplitStackColor(true, false)
    const bottom = pickSplitStackColor(false, false)
    expect(top).toBe('#C9B8E5') // light[0]
    expect(bottom).toBe('#6F42C1') // all[0]
  })
})

describe('findSeriesIndex', () => {
  it('finds index in primary keys', () => {
    expect(findSeriesIndex('b', ['a', 'b', 'c'], [])).toBe(1)
  })

  it('finds index in compare keys (takes precedence)', () => {
    expect(findSeriesIndex('b', ['a', 'b'], ['b', 'c'])).toBe(0)
  })

  it('returns -1 for unknown key', () => {
    expect(findSeriesIndex('z', ['a', 'b'], ['c'])).toBe(-1)
  })
})
