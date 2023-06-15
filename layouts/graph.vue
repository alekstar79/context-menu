<template>
  <v-app class="app-root">
    <v-main ref="ctx">
      <nuxt />
    </v-main>

    <client-only>
      <core-context
        v-model="event"
        :buttons="buttons"
        @toggle="contextOnChange"
      />
    </client-only>
  </v-app>
</template>

<script>
import { context } from '~/mixins/common'

export default {
  name: 'LayoutGraph',

  mixins: [context],

  head() {
    const url = `${process.env.BASE_URL}${this.$route.path.toLowerCase().replace(/\/$/, '')}`

    return {
      link: [{ href: url, rel: 'canonical' }],
      bodyAttrs: {
        class: 'theme--light'
      },
      htmlAttrs: {
        class: 'hidden-html'
      }
    }
  },
  computed: {
    event: {
      get() {
        return this.$store.state.context.event
      },
      set(event) {
        this.setContext(event)
      }
    },
    buttons() {
      return this.$store.state.context.buttons
    }
  },
  methods: {
    contextOnChange(event)
    {
      //
    }
  },
  beforeDestroy()
  {
    this.$refs.ctx.$el.removeEventListener('contextmenu', this.setContext, false)
  },
  mounted()
  {
    this.$refs.ctx.$el.addEventListener('contextmenu', this.setContext, false)
  }
}
</script>

<style lang="scss" scoped>
.v-application.app-root {
  transition: background .22s ease-in-out;

  &.theme--light {
    background: #F5F5F5 !important;
  }
  &.theme--dark {
    background: #242424 !important;
  }
}
</style>
