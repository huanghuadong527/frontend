import store from '@/store';
import { redirect } from 'react-router';
import type { MiddlewareFunction } from 'react-router';

/**
 * 路由鉴权中间件：导航前检查登录态，未登录则重定向到登录页。
 */
export const authInterceptorMiddleware: MiddlewareFunction = () => {
	if (!store.getState().core.token) {
		throw redirect('/login');
	}
};
