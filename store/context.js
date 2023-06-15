export const state = () => ({
  active: { graph: null },

  icons: null,
  event: null,

  buttons: [
    { icon: 'new'     },
    { icon: 'open'    },
    { icon: 'link'    },
    { icon: 'webcam'  },
    { icon: 'calc'    },
    { icon: 'pixabay' }
  ]
})

export const mutations = {
  set(state, payload)
  {
    Object.keys(payload).forEach(k => { state[k] = payload[k] })
  }
}
