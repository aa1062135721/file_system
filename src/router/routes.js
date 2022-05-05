/**
 * 自动化导出路由模块
 * */
 let configRouter = []
 const files = require.context('./modules', true, /\.js$/)
 
 files.keys().forEach(key => {
   configRouter = configRouter.concat(files(key).default)
 })
 
 const _import = file => require('@/pages/' + file).default;


const routes = [
    {
        path: '/',
        redirect: { path: '/home' },
    },
    {
        path: '/home',
        name:"home",
        component: _import('home/index'),
        meta: { title: '文件管理' }
    },
    {
        path: '/move',
        name:"move",
        component: _import('home/move'),
        meta: { title: '文件管理-移动' }
    },
    ...configRouter
];

// 重新组织后导出
export default routes;
  