import type { RouteObject } from 'react-router';

export const ROUTER_SHOP: RouteObject[] = [
	{
		path: 'goods',
		lazy: () => import('@/views/page/shop/goods')
	},
	{
		path: 'material',
		lazy: () => import('@/views/page/shop/material')
	},
	{
		path: 'report',
		lazy: () => import('@/views/page/shop/report')
	}
];
