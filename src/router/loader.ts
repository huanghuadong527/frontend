import store from '@/store';
import { redirect } from 'react-router';
import type { RouteObject } from 'react-router';

/**
 * 登录页前置守卫：已登录时直接重定向到首页。
 */
export const beforeEachLoader: RouteObject['loader'] = () => {
	if (store.getState().core.token) {
		return redirect('/index');
	}
	return null;
};
