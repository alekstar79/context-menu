import { kebabCase, trim } from 'lodash/string'
import Router from 'vue-router'
import Vue from 'vue'

import paths from './routes'

Vue.use(Router)

const route = ({ path, name, view, component }) => ({ name: name || view, component, path })

function fixRoutes(routes)
{
  return routes.map(route => convert(route)).concat(paths.map(path => route(path)))
}

function convert({ path, name, component })
{
  if (!/:\w*\??/.test(path)) {
    path = '/' + kebabCase(trim(path, '/'))
  }

  return { path, name, component }
}

export function createRouter(ctx, createDefaultRouter, routerOptions)
{
  const options = routerOptions || createDefaultRouter(ctx).options

  return new Router({
    ...options,

    routes: fixRoutes(options.routes),

    fallback: false
  })
}
