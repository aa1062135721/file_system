import BlankView from '@/layout/BlankView';
const _import = file => require('@/pages/' + file).default
/**
 * 目标路由
 * luyan
 * */
export default [
    {
        path: '/jurisdiction',
        name:"jurisdiction",
        component:BlankView,
        redirect: { name: 'jurisdictionIndex' },
        children:[
            {
                path: 'index',
                name: 'jurisdictionIndex',
                component: _import('jurisdiction/index'),
                meta: { title: '文件管理-权限管理' }
            },
            {
                path:'edit',
                name:"jurisdictionEdit",
                component:_import('jurisdiction/edit'),
                meta: { title: '文件管理-权限编辑' }
            },
            {
                path:'change',
                name:"jurisdictionChange",
                component:_import('jurisdiction/change'),
                meta: { title: '文件管理-添加权限' }
            }
        ]
    },
]