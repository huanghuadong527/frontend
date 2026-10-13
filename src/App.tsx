import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useMemo } from 'react';
import { Outlet } from 'react-router';
import { useStore } from '@/store';
import { getAntdTheme } from './theme';

function App() {
	const primary = useStore((state) => state.root.theme);
	const theme = useMemo(() => getAntdTheme(primary), [primary]);

	return (
		<ConfigProvider locale={zhCN} theme={theme}>
			<AntdApp>
				<Outlet />
			</AntdApp>
		</ConfigProvider>
	);
}

export default App;
