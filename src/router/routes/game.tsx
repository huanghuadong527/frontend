import type { RouteObject } from 'react-router';

export const ROUTER_GAME: RouteObject[] = [
	{
		path: 'game',
		children: [
			{
				path: 'monster',
				lazy: () => import('@/views/page/game/monster')
			},
			{
				path: 'task',
				lazy: () => import('@/views/page/game/task')
			},
			{
				path: 'title',
				lazy: () => import('@/views/page/game/title')
			},
			{
				path: 'skill',
				lazy: () => import('@/views/page/game/skill')
			},
			{
				path: 'equipment',
				lazy: () => import('@/views/page/game/equipment')
			},
			{
				path: 'character',
				lazy: () => import('@/views/page/game/character')
			},
			{
				path: 'violation',
				lazy: () => import('@/views/page/game/violation')
			},
			{
				path: 'gallery',
				lazy: () => import('@/views/page/game/gallery')
			},
			{
				path: 'notice',
				lazy: () => import('@/views/page/game/notice')
			},
			{
				path: 'top',
				lazy: () => import('@/views/page/game/top')
			}
		]
	}
];
