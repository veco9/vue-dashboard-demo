import { describe, it, expect } from 'vitest'
import WidgetHeader from '@/components/widgets/widgetheader/WidgetHeader.vue'
import { mountWithPlugins } from '../helpers/mountComponent'

describe('WidgetHeader', () => {
  it('renders title text', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Revenue' },
    })
    expect(wrapper.find('.widget-header-titlelabel').text()).toBe('Revenue')
  })

  it('renders KPI mode when icon is provided', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Users', icon: 'pi pi-users', subtitle: '1,234' },
    })
    expect(wrapper.find('.kpi-card-stub').exists()).toBe(true)
    expect(wrapper.find('.widget-header-titlelabel').exists()).toBe(false)
  })

  it('renders standard mode (no icon) with title and growth label', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'MRR', growth: true, growthLabel: '+12%' },
    })
    expect(wrapper.find('.widget-header-titlelabel').text()).toBe('MRR')
    const growth = wrapper.find('.widget-header-title-growthlabel')
    expect(growth.text()).toBe('+12%')
    expect(growth.classes()).toContain('text-emerald-600')
  })

  it('applies rose color for negative growth', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Churn', growth: false, growthLabel: '-5%' },
    })
    const growth = wrapper.find('.widget-header-title-growthlabel')
    expect(growth.classes()).toContain('text-rose-600')
  })

  it('renders subtitle items with dividers between them', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: {
        title: 'Revenue',
        subtitleItems: [
          { title: 'Enterprise', color: '#ff0000' },
          { title: 'Startup', color: '#00ff00' },
          { title: 'Free', color: '#0000ff' },
        ],
      },
    })
    const items = wrapper.findAll('.widget-header-subtitleitem-wrapper')
    expect(items).toHaveLength(3)
    // Dividers between items (n-1)
    const dividers = wrapper.findAll('.widget-header-divider')
    expect(dividers).toHaveLength(2)
  })

  it('renders color indicators for subtitle items', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: {
        title: 'Revenue',
        subtitleItems: [{ title: 'Enterprise', color: '#ff0000' }],
      },
    })
    const indicator = wrapper.find('.widget-header-subtitleitem-indicator')
    expect(indicator.exists()).toBe(true)
    expect(indicator.attributes('style')).toContain('background-color: #ff0000')
  })

  it('renders plain subtitle text when no subtitleItems', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Revenue', subtitle: 'Monthly recurring' },
    })
    expect(wrapper.find('.widget-header-subtitleitem-label').text()).toBe('Monthly recurring')
  })

  it('shows remove button in edit mode', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Test', editModeActive: true },
    })
    expect(wrapper.find('.pi-trash').exists()).toBe(true)
  })

  it('hides remove button when not in edit mode', () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Test', editModeActive: false },
    })
    expect(wrapper.find('.pi-trash').exists()).toBe(false)
  })

  it('emits remove-click when trash button is clicked', async () => {
    const wrapper = mountWithPlugins(WidgetHeader, {
      props: { title: 'Test', editModeActive: true },
    })
    await wrapper.find('.pi-trash').trigger('click')
    expect(wrapper.emitted('remove-click')).toHaveLength(1)
  })
})
