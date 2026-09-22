import store, { clear } from '@/store';
import { redirect } from 'react-router';

/**
 * 权限认证
 */
export const authMiddleware = async () => {
	const state = store.getState();

	if (!state.root.token) {
		store.dispatch(clear());

		throw redirect('/login');
	}
};
