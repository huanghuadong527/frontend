import locale from 'antd/es/locale/zh_CN';
import { State } from '@/store';
import { ConfigProvider } from 'antd';
import { SysRouter } from '@/router';
import { useMemo } from 'react';
import { ThemeConfig } from 'antd/es/config-provider/context';
import { useSelector } from 'react-redux';

const App = () => {
	const theme = useSelector<State>((state) => state.theme);

	const globalThemeConfig = useMemo(() => {
		return {
			cssVar: true,
			token: {
				borderRadius: 2,
				colorInfo: theme,
				colorPrimary: theme
			},
			components: {
				Layout: {
					headerBg: theme
				}
			}
		} as ThemeConfig;
	}, [theme]);

	return (
		<ConfigProvider locale={locale} theme={globalThemeConfig}>
			<SysRouter />
		</ConfigProvider>
	);
};

export default App;
