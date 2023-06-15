<template>
  <div class="app-window theme--light">
    <h1>Right click (context menu) anywhere on the screen</h1>
    <h1>Rotate the mouse wheel over the context menu</h1>
  </div>
</template>

<script>
export default {
  layout: 'graph',

  head() {
    return {
      meta: [{ name: 'description', hid: 'description', content: 'Контекстное меню' }]
    }
  },
  methods: {
    contextOnChange()
    {
      //
    },
    contextOnHover()
    {
      //
    }
  },
  mounted()
  {
    //
  }
}
</script>

<!--suppress SassScssResolvedByNameOnly, CssInvalidPropertyValue -->
<style lang="scss" scoped>
.app-window {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 100vh;
  width: 100vw;

  padding: 0;
  margin: 0;

  background-color: $basic-bg-color;
  overflow: hidden;

  h1 {
    font-size: clamp(1.5rem, 3cqw, 5rem);
    font-weight: 900;

    overflow-wrap: break-word;
    text-align: center;

    margin: 10px;

    color: #979797;
    user-select: none;
  }

  &.theme--dark {
    background-color: #242424 !important;
  }
}
</style>
