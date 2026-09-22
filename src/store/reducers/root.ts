import { createSlice } from '@reduxjs/toolkit';
import { CACHE_TABS, THEME_COLOR, THEME_COLOR_KEY, TOKEN_COOKIE_KEY } from '@/core';
import { CACHE } from '@/utils';

const tabs = CACHE.LOCAL.get(CACHE_TABS);

const initialState: RootState = {
	token: CACHE.LOCAL.get(TOKEN_COOKIE_KEY),
	tabs: tabs ? JSON.parse(tabs) : [],
	theme: CACHE.LOCAL.get(THEME_COLOR_KEY) || THEME_COLOR
};

export const store = createSlice({
	name: '系统缓存',
	initialState,
	reducers: {
		setToken(state, { payload }) {
			if (payload) {
				CACHE.LOCAL.set(TOKEN_COOKIE_KEY, payload);
			}
			state.token = payload;
		},
		removeToken(state) {
			CACHE.LOCAL.remove(TOKEN_COOKIE_KEY);
			state.token = null;
		},
		setTabs(state, { payload }) {
			if (payload) {
				CACHE.LOCAL.set(CACHE_TABS, JSON.stringify(payload));
			}
			state.tabs = payload;
		},
		delTabs(state, { payload }) {
			if (payload) {
				if (state.tabs.includes(payload)) {
					state.tabs = state.tabs.filter((tab) => tab != payload);
					CACHE.LOCAL.set(CACHE_TABS, JSON.stringify(state.tabs));
				}
			}
		},
		removeTabs(state) {
			CACHE.LOCAL.remove(CACHE_TABS);
			state.tabs = [];
		},
		setTheme(state, { payload }) {
			if (payload) {
				CACHE.LOCAL.set(THEME_COLOR_KEY, payload);
			}
			state.theme = payload;
		},
		/** 清除缓存 */
		clear(state) {
			CACHE.LOCAL.remove(TOKEN_COOKIE_KEY);
			CACHE.LOCAL.remove(CACHE_TABS);
			state.token = null;
			state.tabs = [];
		}
	}
});

export const {
	setToken,
	removeToken,
	setTabs,
	delTabs,
	removeTabs,
	setTheme,
	clear
} = store.actions;

export default store.reducer;
