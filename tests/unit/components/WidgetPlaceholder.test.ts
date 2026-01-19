import { describe, it, expect } from 'vitest'
import WidgetPlaceholder from '@/components/widgets/widgetplaceholder/WidgetPlaceholder.vue'
import { mountWithPlugins } from '../helpers/mountComponent'

const baseProps = { widgetName: 'Test Widget', editModeActive: false }

describe('WidgetPlaceholder', () => {
  it('renders loading state with role="status"', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading' },
    })
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
  })

  it('renders error state with role="alert"', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'error', errorMsgs: 'Something failed' },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('renders placeholder state with chart icon', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'placeholder' },
    })
    expect(wrapper.find('.pi-chart-bar').exists()).toBe(true)
  })

  it('displays the widget name', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading' },
    })
    expect(wrapper.find('.widget-header-titlelabel').text()).toBe('Test Widget')
  })

  it('computes split error messages for multi-line errors', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'error', errorMsgs: 'Error 1\nError 2\nError 3' },
    })
    // The popover content renders inside the stub — find all list items globally
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0].text()).toBe('Error 1')
    expect(items[2].text()).toBe('Error 3')
  })

  it('shows single error message without list', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'error', errorMsgs: 'Single error' },
    })
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('shows remove button in edit mode', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading', editModeActive: true },
    })
    expect(wrapper.find('.pi-trash').exists()).toBe(true)
  })

  it('hides remove button when not in edit mode and showRemoveBtn is undefined', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading', editModeActive: false },
    })
    expect(wrapper.find('.pi-trash').exists()).toBe(false)
  })

  it('shows remove button when showRemoveBtn is true regardless of edit mode', () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading', editModeActive: false, showRemoveBtn: true },
    })
    expect(wrapper.find('.pi-trash').exists()).toBe(true)
  })

  it('emits remove-click when trash button is clicked', async () => {
    const wrapper = mountWithPlugins(WidgetPlaceholder, {
      props: { ...baseProps, state: 'loading', editModeActive: true },
    })
    await wrapper.find('.pi-trash').trigger('click')
    expect(wrapper.emitted('remove-click')).toHaveLength(1)
  })
})
