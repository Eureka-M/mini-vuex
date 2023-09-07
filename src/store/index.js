import { createStore } from '@/vuex'

export default createStore({
    // 开启严格模式之后，不能通过 $store.state.count 直接修改数据
    // strict: true, 
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
            setTimeout(() => {
                commit('add', payload)
            }, 1000)
        }
    },
    modules: {}
})