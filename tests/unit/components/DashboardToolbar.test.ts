import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import DashboardToolbar from '@/components/dashboard/dashboardtoolbar/DashboardToolbar.vue'
import { mountWithPlugins } from '../helpers/mountComponent'
import type { WidgetPeriod } from '@/models/dashboardWidget'

const basePeriod: WidgetPeriod = {
  dateFrom: dayjs().startOf('month').toDate(),
  dateTo: dayjs().toDate(),
}

function mountToolbar(overrides: Record<string, unknown> = {}) {
  return mountWithPlugins(DashboardToolbar, {
    props: { period: basePeriod, ...overrides },
  })
}

describe('DashboardToolbar', () => {
  // -- Refresh button --
  it('emits refresh when refresh button is clicked', async () => {
    const wrapper = mountToolbar()
    const refreshBtn = wrapper.find('button.pi-refresh')
    expect(refreshBtn.exists()).toBe(true)
    await refreshBtn.trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  // -- Edit mode toggle --
  it('emits update:editModeActive when edit button is clicked', async () => {
    const wrapper = mountToolbar({ editModeActive: false })
    // Edit button has pi-pencil icon when not in edit mode
    const editBtn = wrapper.find('button.pi-pencil')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')
    expect(wrapper.emitted('update:editModeActive')?.[0]).toEqual([true])
  })

  it('emits update:editModeActive(false) when done button is clicked', async () => {
    const wrapper = mountToolbar({ editModeActive: true })
    // Done button has pi-check icon
    const doneBtn = wrapper.find('button.pi-check')
    expect(doneBtn.exists()).toBe(true)
    await doneBtn.trigger('click')
    expect(wrapper.emitted('update:editModeActive')?.[0]).toEqual([false])
  })

  // -- Reset button --
  it('emits reset when reset button is clicked', async () => {
    const wrapper = mountToolbar()
    const resetBtn = wrapper.find('button.pi-replay')
    expect(resetBtn.exists()).toBe(true)
    await resetBtn.trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  // -- Simulate buttons (only visible in edit mode) --
  it('shows simulate-error button only in edit mode', () => {
    const notEdit = mountToolbar({ editModeActive: false })
    expect(notEdit.find('button.pi-exclamation-triangle').exists()).toBe(false)

    const edit = mountToolbar({ editModeActive: true })
    expect(edit.find('button.pi-exclamation-triangle').exists()).toBe(true)
  })

  it('emits simulate-error when button is clicked', async () => {
    const wrapper = mountToolbar({ editModeActive: true })
    await wrapper.find('button.pi-exclamation-triangle').trigger('click')
    expect(wrapper.emitted('simulate-error')).toHaveLength(1)
  })

  it('shows simulate-loading button only in edit mode', () => {
    const notEdit = mountToolbar({ editModeActive: false })
    expect(notEdit.find('button.pi-spin').exists()).toBe(false)

    const edit = mountToolbar({ editModeActive: true })
    expect(edit.find('button.pi-spin').exists()).toBe(true)
  })

  it('emits simulate-loading when button is clicked', async () => {
    const wrapper = mountToolbar({ editModeActive: true })
    await wrapper.find('button.pi-spin').trigger('click')
    expect(wrapper.emitted('simulate-loading')).toHaveLength(1)
  })

  // -- Hidden controls --
  it('hides period picker when hidePeriod is true', () => {
    const wrapper = mountToolbar({ hidePeriod: true })
    expect(wrapper.find('.period-picker-wrapper').exists()).toBe(false)
  })

  it('shows period picker by default', () => {
    const wrapper = mountToolbar()
    expect(wrapper.find('.period-picker-wrapper').exists()).toBe(true)
  })

  it('hides edit and reset buttons when hideEdit is true', () => {
    const wrapper = mountToolbar({ hideEdit: true })
    expect(wrapper.find('button.pi-pencil').exists()).toBe(false)
    expect(wrapper.find('button.pi-replay').exists()).toBe(false)
  })

  // -- Period button label --
  it('displays formatted period in the button label', () => {
    const wrapper = mountToolbar()
    const label = wrapper.find('.period-picker-btn-label')
    expect(label.exists()).toBe(true)
    // Should contain an arrow between dates
    expect(label.text()).toContain('→')
  })
})
