import { describe, it, expect, vi } from 'vitest'

// Undo the global KpiCard mock so we test the real component
vi.unmock('@/components/widgets/kpicard/KpiCard.vue')

import KpiCard from '@/components/widgets/kpicard/KpiCard.vue'
import { mountWithPlugins } from '../helpers/mountComponent'

describe('KpiCard', () => {
  it('renders label text', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Active Users' },
    })
    expect(wrapper.find('.kpicard-label').text()).toBe('Active Users')
  })

  it('renders numeric label', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 42_000 },
    })
    expect(wrapper.find('.kpicard-label').text()).toBe('42000')
  })

  it('renders leading label', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', leadingLabel: '$12,345' },
    })
    expect(wrapper.find('.kpicard-leadinglabel').text()).toBe('$12,345')
  })

  it('renders icon with wrapper color', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', icon: 'pi pi-users', iconWrapperColor: '#ff0000' },
    })
    const iconWrapper = wrapper.find('.kpicard-iconwrapper')
    expect(iconWrapper.exists()).toBe(true)
    expect(iconWrapper.attributes('style')).toContain('#ff0000')
    expect(wrapper.find('.pi-users').exists()).toBe(true)
  })

  it('hides icon for small size', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', icon: 'pi pi-users', size: 'small' },
    })
    expect(wrapper.find('.kpicard-iconwrapper').exists()).toBe(false)
    expect(wrapper.classes()).toContain('kpicard-small')
  })

  it('hides icon for medium size', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', icon: 'pi pi-users', size: 'medium' },
    })
    expect(wrapper.find('.kpicard-iconwrapper').exists()).toBe(false)
    expect(wrapper.classes()).toContain('kpicard-medium')
  })

  it('applies custom icon wrapper class', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', icon: 'pi pi-users', iconWrapperClass: 'my-custom-class' },
    })
    expect(wrapper.find('.kpicard-iconwrapper').classes()).toContain('my-custom-class')
  })

  it('shows positive growth with emerald color and up arrow', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Revenue', leadingLabel: '$50k', growth: true, growthLabel: '+12%' },
    })
    const growthEl = wrapper.find('.kpicard-growthlabel')
    expect(growthEl.text()).toBe('+12%')
    expect(growthEl.classes()).toContain('text-emerald-600')
    expect(wrapper.find('.pi-arrow-up').exists()).toBe(true)
  })

  it('shows negative growth with rose color and down arrow', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Churn', leadingLabel: '5%', growth: false, growthLabel: '-3%' },
    })
    const growthEl = wrapper.find('.kpicard-growthlabel')
    expect(growthEl.text()).toBe('-3%')
    expect(growthEl.classes()).toContain('text-rose-600')
    expect(wrapper.find('.pi-arrow-down').exists()).toBe(true)
  })

  it('uses custom growth icon when provided', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Revenue', growth: true, growthLabel: '+5%', growthCustomIcon: 'pi pi-star' },
    })
    expect(wrapper.find('.pi-star').exists()).toBe(true)
    expect(wrapper.find('.pi-arrow-up').exists()).toBe(false)
  })

  it('hides growth section when growth is undefined', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Revenue', leadingLabel: '$50k' },
    })
    expect(wrapper.find('.kpicard-growth-wrapper').exists()).toBe(false)
  })

  it('renders sub-label with separator', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Users', subLabel: '10,000' },
    })
    expect(wrapper.find('.kpicard-sublabel').text()).toContain('10,000')
  })

  it('renders compare label with divider', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Revenue', compareLabel: 'vs $40k' },
    })
    expect(wrapper.find('.kpicard-comparelabel').text()).toBe('vs $40k')
    expect(wrapper.find('.kpicard-comparelabel-divider').exists()).toBe(true)
  })

  it('renders donut chart instead of icon when donut prop is provided', () => {
    const wrapper = mountWithPlugins(KpiCard, {
      props: { label: 'Distribution', donut: { values: [30, 70] } },
    })
    expect(wrapper.find('.donut-chart-stub').exists()).toBe(true)
    expect(wrapper.find('.kpicard-iconwrapper').exists()).toBe(false)
  })
})
