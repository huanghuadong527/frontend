import App from '@/App';
import { createBrowserRouter, Navigate } from 'react-router';
import { authMiddleware } from '../middleware';
import { authLoader } from '../loader';

import { Index } from '@/views/layout';
import { Login } from '@/views/page/login';
import { Welcome } from '@/views/page/welcome';
import { ROUTER_SYSTEM } from './system';
import { ROUTER_MONITOR } from './monitor';
import { ROUTER_SHOP } from './shop';
import { ROUTER_STUDY } from './study';
import { ROUTER_GAME } from './game';
import { RootErrorBoundary } from '../error-boundary';

export const GLOBAL_ROUTER = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		ErrorBoundary: RootErrorBoundary,
		children: [
			{
				index: true,
				element: <Navigate replace to='/index' />
			},
			{
				path: 'index',
				element: <Index />,
				middleware: [authMiddleware],
				loader: authLoader,
				HydrateFallback: () => null,
				ErrorBoundary: RootErrorBoundary,
				children: [
					{
						index: true,
						element: <Welcome />
					},
					...ROUTER_SYSTEM,
					...ROUTER_MONITOR,
					...ROUTER_SHOP,
					...ROUTER_STUDY,
					...ROUTER_GAME
				]
			},
			{
				path: 'login',
				element: <Login />
			}
		]
	}
]);
