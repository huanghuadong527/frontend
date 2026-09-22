import type { RouteObject } from 'react-router';

export const ROUTER_STUDY: RouteObject[] = [
	{
		path: 'study',
		children: [
			{
				path: 'poem',
				lazy: () => import('@/views/page/study/poem')
			},
			{
				path: 'term',
				lazy: () => import('@/views/page/study/term')
			},
			{
				path: 'word',
				lazy: () => import('@/views/page/study/word')
			}
		]
	}
];
