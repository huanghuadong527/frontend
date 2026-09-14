import {
	CONFIG_FAVICON,
	CONFIG_LOGO,
	CONFIG_MINI_LOGO,
	CONFIG_TITLE,
	GLOBAL_THEME,
	TABS,
	TABS_SELECTABLE,
	THEME_COLOR,
} from '@/core/config';
import { CACHE } from '@/utils';
import { createSlice } from '@reduxjs/toolkit';
import { ConfigProps, SystemState, TabsProps } from './types';

const tabs = CACHE.SESSION.getJSON(TABS);

const initialState: SystemState = {
	theme: CACHE.SESSION.get(GLOBAL_THEME) || THEME_COLOR,
	selectable: CACHE.SESSION.get(TABS_SELECTABLE) || undefined,
	tabs: tabs ? (tabs as TabsProps[]) : [],
	config: undefined,
};

export const store = createSlice({
	name: 'system',
	initialState,
	reducers: {
		setTheme(state, { payload }) {
			if (payload) {
				CACHE.SESSION.set(GLOBAL_THEME, payload);
				state.theme = payload;
			}
		},
		setConfig(state, { payload }) {
			const $config: ConfigProps = {
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
		setSelectable(state, { payload }) {
			CACHE.SESSION.set(TABS_SELECTABLE, payload);
			state.selectable = payload;
		},
		delSelectable(state) {
			CACHE.SESSION.remove(TABS_SELECTABLE);
			state.selectable = undefined;
		},
		setTabs(state, { payload }) {
			CACHE.SESSION.setJSON(TABS, payload);
			state.tabs = payload;
		},
		delTabs(state) {
			CACHE.SESSION.remove(TABS);
			state.tabs = [];
		},
	},
});

export const {
	setTheme,
	setConfig,
	updateConfig,
	setSelectable,
	delSelectable,
	setTabs,
	delTabs,
} = store.actions;

export default store.reducer;
