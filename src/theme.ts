import type { ThemeConfig } from 'antd';

/** 根据主色生成 antd 主题配置 */
export const getAntdTheme = (primary: string): ThemeConfig => ({
	token: {
		colorPrimary: primary,
		colorInfo: primary,
		colorWarning: '#FF5722',
		borderRadius: 2
	},
	components: {
		Table: {
			headerBg: '#fafafa',
			headerSplitColor: 'transparent',
			cellPaddingBlock: 8,
			cellPaddingInline: 12
		}
	}
});
