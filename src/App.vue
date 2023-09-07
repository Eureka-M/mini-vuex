<template>
    <p>count:  {{ count }} {{ $store.state.count }} </p>
    <!-- <p>getter: {{ double }} {{ $store.getters.double }}</p> -->
    <button @click="$store.state.count++">错误</button>
    <button @click="add">同步修改</button>
    <button @click="asyncAdd">异步修改</button>
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
            store.dispatch('asyncAdd', 1)
        }

        return {
            count: computed(() => store.state.count),
            double: computed(() => store.getters.double),
            add,
            asyncAdd
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
