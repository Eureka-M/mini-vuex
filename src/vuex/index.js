import { inject, reactive } from "vue"

const storeKey = 'store'

export function forEachValue(obj, fn) {
    Object.keys(obj).forEach(key => fn(obj[key], key))
}

class Store {
    constructor(options) {
        const store = this
        store._state = reactive({ data: options.state })

        const _getters = options.getters // { double: function => getter }
        store.getters = {}


    }
    get state() {
        return this._state.data
    }
    install(app, injectKey) { // createApp().use(store, 'store')
        app.provide(injectKey || storeKey, this) // 给根 app 增加一个 provide，子组件会向上查找
        app.config.globalProperties.$store = this // 添加 $store
    }
}

export function createStore(options) {
    return new Store(options)
}

export function useStore(injectKey = null) {
    return inject(injectKey !== null ? injectKey : storeKey)
}