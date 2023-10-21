<template>
    <p>count:  {{ count }} {{ $store.state.count }} </p>
    <p>getter: {{ double }} {{ $store.getters.double }}</p>
    <button @click="$store.state.count++">错误</button>
    <button @click="add">同步修改</button>
    <button @click="asyncAdd">异步修改</button>
    <br>
    <p> a 模块：aCount: {{ aCount }}</p>
    <p> b 模块：bCount: {{ bCount }}</p>
    <p> c 模块：cCount: {{ cCount }}</p>
    <p> d 模块：dCount: {{ dCount }}</p>
    <button @click="$store.commit('aCount/add', 1)">改 a</button>
    <button @click="$store.commit('bCount/add', 1)">改 b</button>
    <button @click="$store.commit('aCount/cCount/add', 1)">改 c</button>
    <button @click="$store.commit('bCount/dCount/add', 1)">改 d</button>
</template>

<script>
import { useStore } from '@/vuex'
import { computed  } from 'vue'

export default {
    name: 'App',
    setup() {
        const store = useStore()
        console.log(store)

        function add() {
            store.commit('add', 1)
        }
        function asyncAdd() {
            store.dispatch('asyncAdd', 1).then(() => {
                console.log('asyncAdd resolved')
            })
        }

        return {
            count: computed(() => store.state.count),
            double: computed(() => store.getters.double),
            add,
            asyncAdd,
            aCount: computed(() => store.state.aCount.count),
            bCount: computed(() => store.state.bCount.count),
            cCount: computed(() => store.state.aCount.cCount.count),
            dCount: computed(() => store.state.bCount.dCount.count),
        }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
