import ReactDOM from 'react-dom/client';
import store from '@/store';
import locale from 'antd/es/locale/zh_CN';
import RenderError from './error';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from '@/components';
import { SysRouter } from '@/router';
import { ConfigProvider } from 'antd';

import './index.less';

ConfigProvider.config({
	theme: {
		primaryColor: '#2EAFBB',
	},
});

const root = document.getElementById('root');

try {
	if (root) {
		ReactDOM.createRoot(root).render(
			// 这仅适用于开发模式
			// 生产模式下生命周期不会被调用两次。
			// <React.StrictMode>
			<ErrorBoundary renderError={RenderError}>
				<ConfigProvider locale={locale}>
					<Provider store={store}>
						<Router>
							<SysRouter />
						</Router>
					</Provider>
				</ConfigProvider>
			</ErrorBoundary>
			// </React.StrictMode>
		);
	}
} catch (error) {
	console.error(`%c 系统故障, 请联系管理员!`);
}
