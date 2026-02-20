// import fs from 'node:fs'
import path from 'path'

require('dotenv').config()

const dirs = ['components','layouts','lang','mixins','pages','plugins','store'],
  viewport = 'width=device-width,initial-scale=1,viewport-fit=cover',

  { NODE_ENV } = process.env,
  IS_DEV = NODE_ENV !== 'production'

export default {
  target: 'server',
  ssr: false,

  components: true,

  loading: false,

  env: {
    ORIGIN: { URL: process.env.ORIGIN_URL },
    APP: {
      URI: process.env.APP_URI,
      ID: process.env.APP_ID
    },

    NODE_ENV,
    IS_DEV
  },

  head: {
    titleTemplate: 'Context menu',

    htmlAttrs: {
      lang: 'ru'
    },
    meta: [
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge,chrome=1' },
      { name: 'description', hid:  'description', content: process.env.npm_package_description },
      { name: 'theme-color', content: '#ededed' },
      { name: 'viewport', content: viewport }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/context-menu/favicon.png' }
    ]
  },

  css: [
    { src: 'normalize.css'           },
    { src: '~/assets/css/global.css' }
  ],

  plugins: [
    { src: '~/plugins/client', mode: 'client' },
    { src: '~/plugins/common' }
  ],

  router: {
    mode: 'history',
    base: '/context-menu/',
    prefetchLinks: false
  },

  render: {
    crossorigin: '',
    resourceHints: true,
    asyncScripts: true,
    compressor: false,
    etag: false,

    static: {
      etag: false
    },
    http2: {
      push: true
    }
  },

  buildModules: [
    ['@nuxtjs/router', { keepDefaultRouter: true }],
    ['@nuxtjs/eslint-module'],
    ['@nuxtjs/vuetify'],
    ['@nuxtjs/dotenv']
  ],

  modules: [
    ['@nuxtjs/i18n']
  ],

  axios: {
    baseURL: process.env.BASE_URL,
    browserBaseURL: '/context-menu/api',
    progress: false,
    proxy: false
  },

  pwa: {
    manifest: {
      name: 'Context menu',
      short_name: 'CM',
      lang: 'ru',

      background_color: '#ededed',
      theme_color: '#ededed'
    },
    meta: {
      title: 'Context menu',
      author: 'alekstar79',
      description: process.env.npm_package_description,
      viewport
    },
    icon: {
      purpose: 'any'
    }
  },

  vuetify: {
    customVariables: ['~/assets/scss/variables.scss'],
    optionsPath: '~/vuetify.options.js',
    defaultAssets: false,
    treeShake: true,
    options: {
      customProperties: true
    }
  },

  i18n: {
    detectBrowserLanguage: false,
    loadLanguagesAsync: true,
    lazy: true,

    strategy: 'no_prefix',
    fallbackLocale: 'ru',
    defaultLocale: 'ru',
    langDir: '~/lang/',

    locales: [
      { code: 'en', iso: 'en-US', file: 'en.js', dir: 'ltr' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.js', dir: 'ltr' }
    ]
  },

  build: {
    publicPath: '/context-menu/',

    optimization: {
      minimize: !IS_DEV,
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
        maxSize: 512000
      }
    },

    splitChunks: {
      layouts: true
    },

    terser: {
      parallel: true,
      terserOptions: {
        safari10: true,

        compress: {
          drop_console: false
        }
      }
    },

    ...(!IS_DEV && { extractCSS: true, ignoreOrder: true }),

    optimizeCss: true,

    filenames: {
      font: () => 'fonts/[name].[ext]'
    },

    extend(config, { /* isClient, isDev, loaders */ })
    {
      dirs.map(d => config.resolve.alias[d] = path.resolve(__dirname, d))

      config.resolve.extensions.push('.ts','.css','.scss','.sass')

      config.module.rules
        .filter(r => r.test.toString().match(/\(.*svg.*\)/))
        .forEach(r => {
          r.test = /\.(png|jpe?g|gif|webp)$/
          r.use = [{ loader: 'url-loader' }]
        })

      config.module.rules.push({
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /inline/,
            use: [{
              loader: 'vue-svg-loader',
              options: {
                extract: true,
                svgo: false
              }
            }]
          },
          { resourceQuery: /data/, loader: 'url-loader' },
          { resourceQuery: /raw/,  loader: 'raw-loader' },
          { loader: 'file-loader' }
        ]
      })
    }
  }

  /* server: {
    https: {
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
      key: fs.readFileSync(path.resolve(__dirname, 'key.pem'))
    },

    port: 3000,
    host: 'localhost',
    timing: false
  } */
}
