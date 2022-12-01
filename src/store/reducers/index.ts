import { ConfigProps, FETCH_ERROR, State } from '@/store/types';
import { createSlice } from '@reduxjs/toolkit';
import {
	THEME_COLOR,
	CONFIG_FAVICON,
	CONFIG_LOGO,
	CONFIG_MINI_LOGO,
	CONFIG_TITLE,
	TABS,
	TABS_SELECTABLE,
	TOKEN_COOKIE_KEY,
	GLOBAL_THEME,
} from '@/core';
import { message } from 'antd';

let tabs = sessionStorage.getItem(TABS);

const initialState: State = {
	theme: sessionStorage.getItem(GLOBAL_THEME) || THEME_COLOR,
	token: sessionStorage.getItem(TOKEN_COOKIE_KEY) || '',
	user: undefined,
	roles: [],
	permissions: [],
	selectable: sessionStorage.getItem(TABS_SELECTABLE) || undefined,
	tabs: tabs ? JSON.parse(tabs) : [],
	menus: [],
	config: undefined,
};

export const store = createSlice({
	name: 'System State Manager',
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
		setGloblaTheme(state, { payload }) {
			if (payload) {
				sessionStorage.setItem(GLOBAL_THEME, payload);
				state.theme = payload;
			}
		},
		setConfig(state, { payload }) {
			let $config: ConfigProps = {
				title: '',
				favicon: '',
				logo: '',
				miniLogo: '',
			};
			if (payload && Array.isArray(payload)) {
				payload.forEach((item) => {
					if (item.configKey == CONFIG_TITLE) {
						$config.title = item.configValue;
					}
					if (item.configKey == CONFIG_FAVICON) {
						$config.favicon = item.configValue;
					}
					if (item.configKey == CONFIG_LOGO) {
						$config.logo = item.configValue;
					}
					if (item.configKey == CONFIG_MINI_LOGO) {
						$config.miniLogo = item.configValue;
					}
				});
			}
			state.config = $config;
		},
		updateConfig(state, { payload }) {
			if (!state.config) {
				state.config = {
					title: '',
					favicon: '',
					logo: '',
					miniLogo: '',
				};
			}
			if (payload.configKey == CONFIG_LOGO) {
				state.config.logo = payload.configValue;
			}
			if (payload.configKey == CONFIG_MINI_LOGO) {
				state.config.miniLogo = payload.configValue;
			}
		},
		setConfigInfo(state, { payload }) {
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
		},
	},
});

export const {
	setToken,
	setGloblaTheme,
	setConfig,
	setConfigInfo,
	setSelectable,
	setMenus,
	setTabs,
	updateConfig,
	delToken,
	delSelectable,
	delTabs,
} = store.actions;

export default store.reducer;
