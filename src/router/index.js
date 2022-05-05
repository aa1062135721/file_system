import VueRouter  from "vue-router";
import Vue from "vue";
// 路由数据
import routes from './routes'
Vue.use(VueRouter);

// 导出路由 在 main.js 里使用
const router = new VueRouter({
    routes
})

export default router;