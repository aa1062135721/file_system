import BlankView from '@/layout/BlankView';
const _import = file => require('@/pages/' + file).default
/**
 * 任汇报路由
 * tanhao
 * */
export default [
    {
        path: '/recentBrowsing',
        name:"recentBrowsing",
        component:BlankView,
        redirect: { name: 'recentBrowsingIndex' },
        children:[
            {
                path: 'index',
                name: 'recentBrowsingIndex',
                component: _import('recentBrowsing/index'),
                meta: { title: '文件管理-最近浏览' }
            },
        ]
    },
]