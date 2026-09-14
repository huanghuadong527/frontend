import { TOKEN_COOKIE_KEY } from '@/core/config';
import { getSystemUserInfo } from '@/service/common';
import { getMenuListData } from '@/service/application/menu';
import { CACHE } from '@/utils';
import { toArrayTree, mapTree, eachTree } from 'xe-utils';
import { createAppSlice } from './slice';
import { CoreState, MenuProp, UserProps } from './types';

const initialState: CoreState = {
	token: CACHE.SESSION.get(TOKEN_COOKIE_KEY) || undefined,
	user: undefined,
	roles: [],
	permissions: [],
	menus: [],
};

export const slice = createAppSlice({
	name: 'core',
	initialState,
	reducers: (create) => ({
		setToken: create.reducer<string>((state, { payload }) => {
			state.token = payload;
			CACHE.SESSION.set(TOKEN_COOKIE_KEY, payload);
		}),
		delToken: create.reducer((state) => {
			state.token = undefined;
			CACHE.SESSION.remove(TOKEN_COOKIE_KEY);
		}),
		getUserData: create.asyncThunk(
			async () => {
				return await getSystemUserInfo();
			},
			{
				pending() {},
				rejected(state) {
					state.user = undefined;
				},
				fulfilled(state, { payload }) {
					if (payload.code == 200) {
						const data = payload as JsonResult & {
							user?: UserProps;
							roles?: string[];
							permissions?: string[];
						};
						state.user = data.user;
						state.roles = data.roles || [];
						state.permissions = data.permissions || [];
					}
				},
			},
		),
		getMenusData: create.asyncThunk(
			async () => {
				return await getMenuListData({});
			},
			{
				pending() {},
				rejected(state) {
					state.menus = [];
				},
				fulfilled(state, { payload }) {
					if (payload.code == 200) {
						const menuTree = toArrayTree(payload.data);
						const formatTree = mapTree(menuTree, (item: any) => {
							const params = {
								key: item.id.toString(),
								label: item.menuName,
							};
							if (item.menuType == 'C') {
								return { ...params, path: item.path };
							} else if (item.menuType == 'M') {
								return {
									...params,
									icon: item.icon || '',
								};
							}
							return params;
						});
						eachTree(formatTree, (item: any) => {
							if (item.children && item.children.length == 0) {
								Reflect.deleteProperty(item, 'children');
							}
						});
						state.menus = formatTree as MenuProp[];
					}
				},
			},
		),
	}),
});

export const { setToken, delToken, getUserData, getMenusData } = slice.actions;

export default slice.reducer;
