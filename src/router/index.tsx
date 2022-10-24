import { lazy, Suspense, useEffect } from 'react';
import { useRoutes, useNavigate, RouteObject } from 'react-router-dom';
import { Loading } from '@/components';
import { useSelector } from 'react-redux';
import { UseStore } from '@/store';

import Home from '@/views/home';
import Login from '@/views/login';

/**
 * 系统路由
 */
function SysRouter() {
	return useRoutes([
		{
			path: '/',
			element: <Redirect to='/index' />,
		},
		{
			path: '/login',
			element: <Login />,
		},
		{
			path: '/index',
			element: (
				<BeforeEach>
					<Home />
				</BeforeEach>
			),
			children: AppRouter,
		},
	]);
}

export { SysRouter };

/**
 * 业务路由
 */
const AppRouter: RouteObject[] = [
	{
		path: '',
		element: <Lazy template={() => import('@/views/default')} />,
	},
	{
		path: '/index/user',
		element: <Lazy template={() => import('@/views/page/system/User')} />,
	},
	{
		path: '/index/config',
		element: <Lazy template={() => import('@/views/page/system/Config')} />,
	},
	{
		path: '/index/dept',
		element: <Lazy template={() => import('@/views/page/system/Dept')} />,
	},
	{
		path: '/index/dict',
		element: <Lazy template={() => import('@/views/page/system/Dict')} />,
	},
	{
		path: '/index/menu',
		element: <Lazy template={() => import('@/views/page/system/Menu')} />,
	},
	{
		path: '/index/post',
		element: <Lazy template={() => import('@/views/page/system/Post')} />,
	},
	{
		path: '/index/role',
		element: <Lazy template={() => import('@/views/page/system/Role')} />,
	},
	{
		path: '/index/notice',
		element: <Lazy template={() => import('@/views/page/system/Notice')} />,
	},
	{
		path: '/index/operlog',
		element: <Lazy template={() => import('@/views/page/system/Operlog')} />,
	},
	{
		path: '/index/logininfor',
		element: <Lazy template={() => import('@/views/page/system/Logininfor')} />,
	},
	{
		path: '/index/online',
		element: <Lazy template={() => import('@/views/page/monitor/Online')} />,
	},
	{
		path: '/index/cache',
		element: <Lazy template={() => import('@/views/page/monitor/Cache')} />,
	},
	{
		path: '/index/server',
		element: <Lazy template={() => import('@/views/page/monitor/Server')} />,
	},
	{
		path: '/index/gen',
		element: <Lazy template={() => import('@/views/page/tool/gen/index')}/>,
	},
	{
		path: '/index/swagger',
		element: <Lazy template={() => import('@/views/page/tool/Swagger')}/>,
	},
	{
		path: '/index/character',
		element: (
			<Lazy template={() => import('@/views/page/shopping/Character')} />
		),
	},
	{
		path: '/index/game-server',
		element: (
			<Lazy template={() => import('@/views/page/shopping/GameServer')} />
		),
	},
	{
		path: '/index/private-server',
		element: (
			<Lazy template={() => import('@/views/page/shopping/PrivateServer')} />
		),
	},
	{
		path: '/index/sy-notice',
		element: <Lazy template={() => import('@/views/page/shopping/SyNotice')} />,
	},
	{
		path: '/index/wm-player-role',
		element: (
			<Lazy template={() => import('@/views/page/shopping/WmPlayerRole')} />
		),
	},
	{
		path: '/index/wm-current-price',
		element: (
			<Lazy template={() => import('@/views/page/shopping/WmCurrentPrice')} />
		),
		children: [
			{
				path: '',
				element: (
					<Lazy
						template={() => import('@/views/page/shopping/WmCurrentPrice/Type')}
					/>
				),
			},
			{
				path: '/index/wm-current-price/list/:id',
				element: (
					<Lazy
						template={() => import('@/views/page/shopping/WmCurrentPrice/List')}
					/>
				),
			},
		],
	},
];

/**
 * 权限路由
 * @param routes 系统路由
 */
function Lazy({ template }: { template: () => Promise<any> }) {
	const Component = lazy(template);
	return (
		<Suspense fallback={<Loading></Loading>}>
			<BeforeEach>
				<Component />
			</BeforeEach>
		</Suspense>
	);
}

/**
 * 路由权限拦截器
 * @param props 指定路由
 */
function BeforeEach({ children }: { children: JSX.Element }) {
	const { token } = useSelector((state: UseStore) => state.common);
	return token ? children : <Redirect to='/login'></Redirect>;
}

/**
 * react router dom v6 中已经抛弃了 Redirect
 * 但是可以使用 Navigate(组件)或useNavigate(hook)作为替代方案
 */
function Redirect({
	to,
	replace,
	state,
}: {
	to: string;
	replace?: boolean;
	state?: object;
}): null {
	const navigate = useNavigate();

	useEffect(() => {
		navigate(to, { replace, state });
	});

	return null;
}
