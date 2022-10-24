import { FETCH_ERROR, State } from '@/store/types';
import { createSlice } from '@reduxjs/toolkit';
import { TABS, TABS_SELECTABLE, TOKEN_COOKIE_KEY } from '@/core';
import { message } from 'antd';

let tabs = sessionStorage.getItem(TABS);

const initialState: State = {
	token: sessionStorage.getItem(TOKEN_COOKIE_KEY) || '',
	user: undefined,
	roles: [],
	permissions: [],
	selectable: sessionStorage.getItem(TABS_SELECTABLE) || undefined,
	tabs: tabs ? JSON.parse(tabs) : [],
	menus: [],
};

export const store = createSlice({
	name: 'system state manager',
	initialState,
	reducers: {
		setToken(state, { payload }) {
			sessionStorage.setItem(TOKEN_COOKIE_KEY, payload);
			state.token = payload;
		},
		delToken(state) {
			sessionStorage.removeItem(TOKEN_COOKIE_KEY);
			state.token = undefined;
		},
		setSysConfig(state, { payload }) {
			if ('user' in payload) {
				state.user = { ...state.user, ...payload.user };
			}
			if ('roles' in payload) {
				state.roles = payload.roles;
			}
			if ('permissions' in payload) {
				state.permissions = payload.permissions;
			}
		},
		setSelectable(state, { payload }) {
			sessionStorage.setItem(TABS_SELECTABLE, payload);
			state.selectable = payload;
		},
		delSelectable(state) {
			sessionStorage.removeItem(TABS_SELECTABLE);
			state.selectable = undefined;
		},
		setTabs(state, { payload }) {
			sessionStorage.setItem(TABS, JSON.stringify(payload));
			state.tabs = payload;
		},
		delTabs(state) {
			sessionStorage.removeItem(TABS);
			state.tabs = [];
		},
		setMenus(state, { payload }) {
			state.menus = payload;
		},
		[FETCH_ERROR]() {
			message.error('加载系统资源出错!');
		}
	},
});

export const {
	setToken,
	setSysConfig,
	setSelectable,
	setMenus,
	setTabs,
	delToken,
	delSelectable,
	delTabs,
} = store.actions;

export default store.reducer;
