import type { RouteObject } from 'react-router';

export const ROUTER_SYSTEM: RouteObject[] = [
	{
		path: 'user',
		lazy: () => import('@/views/page/system/user')
	},
	{
		path: 'role',
		lazy: () => import('@/views/page/system/role')
	},
	{
		path: 'menu',
		lazy: () => import('@/views/page/system/menu')
	},
	{
		path: 'dept',
		lazy: () => import('@/views/page/system/dept')
	},
	{
		path: 'post',
		lazy: () => import('@/views/page/system/post')
	},
	{
		path: 'dict',
		lazy: () => import('@/views/page/system/dict')
	},
	{
		path: 'config',
		lazy: () => import('@/views/page/system/config')
	},
	{
		path: 'notice',
		lazy: () => import('@/views/page/system/notice')
	},
	{
		path: 'operlog',
		lazy: () => import('@/views/page/system/operlog')
	},
	{
		path: 'logininfor',
		lazy: () => import('@/views/page/system/logininfor')
	}
];
