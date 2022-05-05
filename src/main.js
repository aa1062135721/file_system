import Vue from 'vue'
import App from './App.vue'
import router from './router'
import "./assets/js/initConfig.js";     //初始化JS
import "./assets/css/public.css";     //初始化JS
import Api from './utils/Api.js'
import store from './store/index'
// import vConsole  from '@/utils/vconsole.js'

Vue.config.productionTip = false

Vue.prototype.Api = Api

// let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJhdWQiOiIiLCJpYXQiOjE2NTA0MTg1NTgsIm5iZiI6IiIsImV4cCI6MTk2MTQ1ODU1OCwidXNlcl9pZCI6MTAsInRva2VuIjoiNDRkOGE3ODFhZTgwZmM0NGZkNGM4YjQxY2EyZTQzZTVhODQ2YWM2ZiJ9.ROe-9MWN489t-dQbae0F8nI455KwpD7boLoon6T4QZc'
// localStorage.setItem('token', token)

router.beforeEach((to, name, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')