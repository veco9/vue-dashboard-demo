import { describe, it, expect } from 'vitest'
import DashboardEmptyState from '@/components/dashboard/dashboardemptystate/DashboardEmptyState.vue'
import { mountWithPlugins } from '../helpers/mountComponent'

describe('DashboardEmptyState', () => {
  it('renders the empty state title', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: false },
    })
    expect(wrapper.find('.dashboard-empty-state-title').text()).toBe('No widgets yet')
  })

  it('shows view-mode subtitle when not in edit mode', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: false },
    })
    expect(wrapper.find('.dashboard-empty-state-text').text()).toBe(
      'Click Edit to start adding widgets',
    )
  })

  it('shows edit-mode subtitle when in edit mode', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: true },
    })
    expect(wrapper.find('.dashboard-empty-state-text').text()).toBe(
      'Drag widgets from the palette below',
    )
  })

  it('shows "Edit Dashboard" button when not in edit mode', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: false },
    })
    // PButton is stubbed — renders as <button> with icon class
    const btn = wrapper.find('button.pi-pencil')
    expect(btn.exists()).toBe(true)
  })

  it('hides "Edit Dashboard" button when in edit mode', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: true },
    })
    expect(wrapper.find('button.pi-pencil').exists()).toBe(false)
  })

  it('emits enter-edit-mode when button is clicked', async () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: false },
    })
    await wrapper.find('button.pi-pencil').trigger('click')
    expect(wrapper.emitted('enter-edit-mode')).toHaveLength(1)
  })

  it('renders the illustration image', () => {
    const wrapper = mountWithPlugins(DashboardEmptyState, {
      props: { editModeActive: false },
    })
    const img = wrapper.find('.dashboard-empty-state-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('No widgets yet')
  })
})
