import { createBrowserRouter, redirect } from 'react-router';
import App from '@/App';
import { Loading, RouterErrorBoundary } from '@/components';
import { beforeEachLoader } from './loader';
import { authInterceptorMiddleware } from './middleware';

export const ROUTES = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		ErrorBoundary: RouterErrorBoundary,
		HydrateFallback: Loading,
		children: [
			{
				index: true,
				loader: () => redirect('/index'),
			},
			{
				path: 'login',
				loader: beforeEachLoader,
				lazy: () => import('@/views/login'),
			},
			{
				path: 'index',
				middleware: [authInterceptorMiddleware],
				lazy: () => import('@/layout'),
				children: [
					{
						index: true,
						lazy: () => import('@/views/default'),
					},
					{
						path: 'welcome',
						lazy: () => import('@/views/page/welcome'),
					},
					{
						path: 'game/equipment',
						lazy: () => import('@/views/page/game/equipment'),
					},
					{
						path: 'game/character',
						lazy: () => import('@/views/page/game/character'),
					},
					{
						path: 'game/violation',
						lazy: () => import('@/views/page/game/violation'),
					},
					{
						path: 'game/monster',
						lazy: () => import('@/views/page/game/monster'),
					},
					{
						path: 'game/skill',
						lazy: () => import('@/views/page/game/skill'),
					},
					{
						path: 'game/task',
						lazy: () => import('@/views/page/game/task'),
					},
					{
						path: 'game/title',
						lazy: () => import('@/views/page/game/title'),
					},
					{
						path: 'study/poem',
						lazy: () => import('@/views/page/study/poem'),
					},
					{
						path: 'study/term',
						lazy: () => import('@/views/page/study/term'),
					},
					{
						path: 'study/word',
						lazy: () => import('@/views/page/study/word'),
					},
					{
						path: 'shop/goods',
						lazy: () => import('@/views/page/shop/goods'),
					},
					{
						path: 'shop/material',
						lazy: () => import('@/views/page/shop/material'),
					},
					{
						path: 'shop/report',
						lazy: () => import('@/views/page/shop/report'),
					},
					{
						path: 'user',
						lazy: () => import('@/views/page/system/User'),
					},
					{
						path: 'config',
						lazy: () => import('@/views/page/system/Config'),
					},
					{
						path: 'dept',
						lazy: () => import('@/views/page/system/Dept'),
					},
					{
						path: 'dict',
						lazy: () => import('@/views/page/system/Dict'),
					},
					{
						path: 'menu',
						lazy: () => import('@/views/page/system/Menu'),
					},
					{
						path: 'post',
						lazy: () => import('@/views/page/system/Post'),
					},
					{
						path: 'role',
						lazy: () => import('@/views/page/system/Role'),
					},
					{
						path: 'notice',
						lazy: () => import('@/views/page/system/Notice'),
					},
					{
						path: 'operlog',
						lazy: () => import('@/views/page/system/Operlog'),
					},
					{
						path: 'logininfor',
						lazy: () => import('@/views/page/system/Logininfor'),
					},
					{
						path: 'online',
						lazy: () => import('@/views/page/monitor/Online'),
					},
					{
						path: 'cache',
						lazy: () => import('@/views/page/monitor/Cache'),
					},
					{
						path: 'server',
						lazy: () => import('@/views/page/monitor/Server'),
					},
					{
						path: 'gen',
						lazy: () => import('@/views/page/tool/gen/index'),
					},
					{
						path: 'swagger',
						lazy: () => import('@/views/page/tool/Swagger'),
					},
					{
						path: 'wm/career',
						lazy: () => import('@/views/page/wm/Career'),
					},
					{
						path: 'wm/realm',
						lazy: () => import('@/views/page/wm/Realm'),
					},
					{
						path: 'wm/skills',
						lazy: () => import('@/views/page/wm/Skills'),
					},
					{
						path: 'wm/equipment',
						lazy: () => import('@/views/page/wm/Equipment'),
					},
					{
						path: 'wm/thing-type',
						lazy: () => import('@/views/page/wm/ThingType'),
					},
					{
						path: 'wm/classify',
						lazy: () => import('@/views/page/wm/Classify'),
					},
				],
			},
		],
	},
]);
