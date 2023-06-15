<template>
  <v-app class="app-root" />
</template>

<script>
import { context } from '~/mixins/common'

export default {
  name: 'LayoutDefault',

  mixins: [context],

  head() {
    return {
      bodyAttrs: {
        class: 'theme--dark'
      },
      htmlAttrs: {
        class: 'screen_100'
      }
    }
  },
  methods: {
    //
  },
  async mounted()
  {
    await this.$nextTick()

    this.clear()
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

  ::v-deep .v-application--wrap {
    .app-main .v-main__wrap {
      .container {
        max-width: 100%;
      }
    }
  }
}
</style>
