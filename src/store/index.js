import Vue from 'vue'
import Vuex from 'vuex'
import nodeInfo from './modules/nodeInfo'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    nodeInfo
  }
})

export default store