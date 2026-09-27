import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    blank?: boolean
    admin?: boolean
  }
}

export {}
