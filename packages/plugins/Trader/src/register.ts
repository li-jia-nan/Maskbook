import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SiteAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./SiteAdaptor/index.js'))),
    },
    ExtensionPage: {
        load: () => import('./ExtensionPage/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./ExtensionPage', () => hot(import('./ExtensionPage/index.js'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
