import { createStore } from '@/vuex'

function customPlugin(store) {
    let local = localStorage.getItem('VUEX:STATE')
    if (local) {
        store.replaceState(JSON.parse(local))
    }
    store.subscribe((mutation, state) => {
        localStorage.setItem('VUEX:STATE', JSON.stringify(state))
    })
}

const store = createStore({
    // 会按照注册的顺序依次执行插件，执行的时候会把store传递过去
    plugins: [
        customPlugin
    ],
    // 开启严格模式之后，不能通过 $store.state.count 直接修改数据
    strict: true, 
    state: {
        count: 0
    },
    getters: {
        double(state) {
            return state.count * 2
        }
    },
    mutations: {
        add(state, payload) {
            state.count += payload
        }
    },
    actions: {
        asyncAdd({ commit }, payload) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    commit('add', payload)
                    resolve()
                }, 1000)
            })
            
        }
    },
    modules: {
        aCount: {
            namespaced: true, // 同名的 mutations 默认会被全部触发，可以根据命名空间拆分开
            state: {
                count: 0
            },
            mutations: {
                add(state, payload) {
                    state.count += payload
                }
            },
            modules: {
                cCount: {
                    namespaced: true,
                    state: {
                        count: 0
                    },
                    mutations: {
                        add(state, payload) {
                            state.count += payload
                        }
                    }
                }
            }
        },
        bCount: {
            namespaced: true,
            state: {
                count: 0
            },
            mutations: {
                add(state, payload) {
                    state.count += payload
                }
            }
        }
    }
})

store.registerModule(['bCount', 'dCount'], {
    namespaced: true,
    state: {
        count: 0
    },
    mutations: {
        add(state, payload) {
            state.count += payload
        }
    }
})

export default store