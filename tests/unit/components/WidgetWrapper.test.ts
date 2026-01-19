import { describe, it, expect } from 'vitest'
import WidgetWrapper from '@/components/widgets/widgetwrapper/WidgetWrapper.vue'
import { mountWithPlugins } from '../helpers/mountComponent'

const baseProps = { widgetName: 'Test Widget', editModeActive: false }

describe('WidgetWrapper', () => {
  it('shows error placeholder when errorMsgs is set (priority over loading)', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: true, errorMsgs: 'Network error', hasData: true },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    // Main content should NOT render when error is present
    expect(wrapper.find('[data-type="widget"]').exists()).toBe(false)
  })

  it('shows loading placeholder when loading and no error', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: true, hasData: false },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('shows loading placeholder when not loading but no data', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: false, hasData: false },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('renders main content when not loading, no error, and has data', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: false, hasData: true },
      slots: { default: '<div class="chart-content">Chart</div>' },
    })
    expect(wrapper.find('[data-type="widget"]').exists()).toBe(true)
    expect(wrapper.find('.chart-content').text()).toBe('Chart')
  })

  it('passes default slot through to content area', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: false, hasData: true },
      slots: { default: '<span id="slot-test">Hello</span>' },
    })
    expect(wrapper.find('#slot-test').text()).toBe('Hello')
  })

  it('renders footer when footerMsg is provided', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: false, hasData: true, footerMsg: 'Updated 5m ago' },
    })
    expect(wrapper.find('.widget-footer-label').text()).toBe('Updated 5m ago')
  })

  it('does not render footer when footerMsg is absent', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, loading: false, hasData: true },
    })
    expect(wrapper.find('.widget-footer').exists()).toBe(false)
  })

  it('shows drag handle in edit mode', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, editModeActive: true, loading: false, hasData: true },
    })
    expect(wrapper.find('.draggable-handle').exists()).toBe(true)
  })

  it('renders WidgetHeader when widgetHeader prop is provided', () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: {
        ...baseProps,
        loading: false,
        hasData: true,
        widgetHeader: { title: 'Revenue' },
      },
    })
    expect(wrapper.find('.widget-header').exists()).toBe(true)
    expect(wrapper.find('.widget-header-titlelabel').text()).toBe('Revenue')
  })

  it('emits remove-click from error placeholder', async () => {
    const wrapper = mountWithPlugins(WidgetWrapper, {
      props: { ...baseProps, errorMsgs: 'fail', editModeActive: true },
    })
    const trashBtn = wrapper.find('.pi-trash')
    expect(trashBtn.exists()).toBe(true)
    await trashBtn.trigger('click')
    expect(wrapper.emitted('remove-click')).toHaveLength(1)
  })
})
