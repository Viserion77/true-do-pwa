/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Theme tokens according to request
const lightTheme = {
  dark: false,
  colors: {
    primary: '#157f3c',
    'primary-darken-1': '#1B5E20',
    secondary: '#f97415',
    accent: '#4CAF50',
    background: '#FEFEFE',
    surface: '#FFFFFF',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      ripple: true,
      variant: 'flat',
      elevation: 0,
      style: 'text-transform: none !important;',
    },
    VCard: { rounded: 'lg' },
    VTextField: { density: 'compact', variant: 'outlined', rounded: 'lg' },
    VSelect: { density: 'compact', variant: 'outlined', rounded: 'lg' },
    VTextarea: { density: 'compact', variant: 'outlined', rounded: 'lg' },
    VAutocomplete: { density: 'compact', variant: 'outlined', rounded: 'lg' },
    VCombobox: { density: 'compact', variant: 'outlined', rounded: 'lg' },
    VChip: { density: 'compact' },
    VList: {
      density: 'comfortable',
      lines: 'one',
      nav: true,
    },
    VListItem: { density: 'comfortable', variant: 'plain' },
    VListSubheader: { class: 'text-caption' },
  },
})
