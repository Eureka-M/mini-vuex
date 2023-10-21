import { reactive, watch } from 'vue'
import { storeKey } from './injectKey'
import ModuleCollection from './module/moduleCollection'
import { forEachValue, isPromise } from './utils'

// 根据路径，获取store上的最新状态
function getNestedState(state, path) {
    return path.reduce((state, key) => state[key], state)
}

function installModule(store, rootState, path, module) {
    const namespaced = store._modules.getNamespaced(path)
    console.log(namespaced)

    let isRoot = !path.length

    if (!isRoot) {
        let parentState = path.slice(0, -1).reduce((state, key) => state[key], rootState)

        store._withCommit(() => {
            parentState[path[path.length - 1]] = module.state
        })
    }

    // getters { double: function(state) {} }
    module.forEachGetter((getter, key) => {
        store._wrapperGetters[namespaced + key] = () => {
            // 直接使用模块的状态，不具备响应式
            return getter(getNestedState(store.state, path))
        }
    })

    // mutations
    module.forEachMutation((mutation, key) => {
        const entry = store._mutations[namespaced + key] || (store._mutations[namespaced + key] = [])
        // store.commit('add', payload)
        entry.push((payload) => {
            mutation.call(store, getNestedState(store.state, path), payload)
        })
    })

    // actions action 执行后返回 promise
    module.forEachAction((action, key) => {
        const entry = store._actions[namespaced + key] || (store._actions[namespaced + key] = [])
        // store.dispatch('add', payload).then(() => {})
        entry.push((payload) => {
            let res = action.call(store, store, payload)
            if (!isPromise) {
                return Promise.resolve(res)
            }
            return res
        })
    })
    
    // init state
    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child)
    })
}

function resetStoreState(store, state) {
    store._state = reactive({ data: state })
    const wrappedGetters = store._wrapperGetters
    store.getters = {}
    forEachValue(wrappedGetters, (getter, key) => {
        Object.defineProperty(store.getters, key, {
            get: getter,
            enumerator: true
        })
    })

    if (store.strict) {
        enableStrictMode(store)
    }
}

function enableStrictMode(store) {
    watch(() => store._state.data, () => {
        console.assert(store._commiting, 'do not mutate vuex store state outside mutation handlers')
    }, {
        deep: true,
        flush: 'sync'
    })
}

export default class Store {
    _withCommit(fn) {
        const commiting = this._commiting
        this._commiting = true
        fn()
        this._commiting = commiting
    }
    constructor(options) {
        const store = this

        store._modules = new ModuleCollection(options)
        
        store._wrapperGetters = Object.create(null)
        store._mutations = Object.create(null)
        store._actions = Object.create(null)

        this.strict = options.strict || false
        // 如何知道是否在 mutation 里调用？
        // 在mutation之前添加一个状态 _commiting = true
        // 调用 mutation 更改状态，监控这个状态
        this._commiting = false



        const state = store._modules.root.state
        installModule(store, state, [], store._modules.root)
        // 定义 store.state.xx
        resetStoreState(store, state)
            

        console.log(state)

        // 等到状态执行完成之后才能插件
        store._subscribes = []
        options.plugins.forEach(plugin => plugin(store))
    }  

    subscribe(fn) {
        this._subscribes.push(fn)
    }

    replaceState(newState) {
        // 严格模式下 不能直播修改状态
        this._withCommit(() => {
            this._state.data = newState
        })
    }

    // 使用箭头函数确保 this 正确
    commit = (type, payload) => {
        const entry = this._mutations[type] || []
        this._withCommit(() => {
            entry.forEach(handler => handler(payload))
        })
        this._subscribes.forEach(sub => sub({type, payload}, this.state))
    }

    dispatch = (type, payload) => {
        const entry = this._actions[type] || []
        return Promise.all(entry.map(handler => handler(payload)))
    }

    get state() {
        return this._state.data
    }

    install(app, injectKey) { // createApp().use(store, 'store')
        // 全局暴露一个变量 暴露的是 store 实例
        app.provide(injectKey || storeKey, this) // 给根 app 增加一个 provide，子组件会向上查找
        app.config.globalProperties.$store = this // 添加 $store
    }

    registerModule(path, rawModule) {
        const store = this
        
        if (typeof path == 'string') {
            path = [path]
        }

        // 要在原有的模块基础上新增加一个
        const newModule = store._modules.register(rawModule, path)
        // 把模块安装上
        installModule(store, store.state, path, newModule)
        // 设置状态
        resetStoreState(store, store.state)
    }
}