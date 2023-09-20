// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import * as directives from 'vuetify/directives';
import * as components from 'vuetify/components';

export default createVuetify({
  directives,
  components,
  theme: {
    defaultTheme: 'dark'
  }
})