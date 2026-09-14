import { App as AntdApp } from 'antd';
import { Outlet } from 'react-router';
import GlobalApp from './redux';
import { ThemeProvider } from './provider';

const App = () => {
	return (
		<ThemeProvider>
			<AntdApp>
				<GlobalApp />
				<Outlet />
			</AntdApp>
		</ThemeProvider>
	);
};

export default App;
