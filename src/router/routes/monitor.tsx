import type { RouteObject } from 'react-router';

export const ROUTER_MONITOR: RouteObject[] = [
	{
		path: 'online',
		lazy: () => import('@/views/page/monitor/online')
	},
	{
		path: 'server',
		lazy: () => import('@/views/page/monitor/server')
	},
	{
		path: 'cache',
		lazy: () => import('@/views/page/monitor/cache')
	}
];
