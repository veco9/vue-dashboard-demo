/**
 * Shared mount helper for component tests.
 * Provides vue-i18n plugin and Transition stub.
 *
 * PrimeVue components (PButton, PPopover, PDivider) and KpiCard are mocked
 * at module level in tests/unit/setup.ts since they are direct imports in SFCs.
 */
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import type { Component } from 'vue'
import { defineComponent } from 'vue'
import en from '@/locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
})

const TransitionStub = defineComponent({
  name: 'Transition',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

export function mountWithPlugins<T extends Component>(
  component: T,
  options: ComponentMountingOptions<T> = {},
) {
  const { global: globalOpts, ...restOptions } = options as Record<string, unknown>
  const g = (globalOpts ?? {}) as Record<string, unknown>

  return mount(component, {
    ...restOptions,
    global: {
      ...g,
      plugins: [i18n, ...((g.plugins as unknown[]) ?? [])],
      directives: {
        tooltip: () => {},
        ...(g.directives as Record<string, unknown> ?? {}),
      },
      stubs: {
        Transition: TransitionStub,
        ...((g.stubs as Record<string, unknown>) ?? {}),
      },
    },
  } as ComponentMountingOptions<T>)
}
