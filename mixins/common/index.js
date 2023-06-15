export const context = {
  methods: {
    clear()
    {
      document.body.querySelectorAll('svg').forEach(svg => {
        document.body === svg.parentNode && svg.remove()
      })
    },
    setContext(event)
    {
      this.$store.commit('context/set', { event })
    }
  }
}
