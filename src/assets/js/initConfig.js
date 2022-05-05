import Vue from 'vue';
import 'lib-flexible';
import Vant from 'vant';
import 'vant/lib/index.css';
import "@/components/index.js";     //全局组件
Vue.use(Vant);

import apiIndex from "./api/index.js"; //请求Api
Vue.prototype.$http = apiIndex;