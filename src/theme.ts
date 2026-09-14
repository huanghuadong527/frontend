import { ThemeConfig } from 'antd';
import { THEME_COLOR } from '@/core/config';

export const createThemeConfig = (
	colorPrimary: string = THEME_COLOR
): ThemeConfig => ({
	token: {
		borderRadius: 2,
		colorInfo: colorPrimary,
		colorPrimary,
	},
	components: {
		Layout: {
			headerBg: colorPrimary,
			headerColor: '#ffffff',
		},
	},
});
