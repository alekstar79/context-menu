export const state = () => ({
  color: 'accent',
  theme: 'dark',
  locale: 'en',
  user: null,
  menu: .7
})

export const mutations = {
  set(state, payload)
  {
    Object.keys(payload).forEach(k => { state[k] = payload[k] })
  }
}
