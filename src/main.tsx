import ReactDOM from 'react-dom/client';
import RenderError from '@/error';
import store from '@/store';
import App from '@/App';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@/components';

import '@/index.css';

const root = document.getElementById('root');

try {
	if (root) {
		ReactDOM.createRoot(root).render(
			// 这仅适用于开发模式
			// 生产模式下生命周期不会被调用两次。
			// <React.StrictMode>
			<ErrorBoundary renderError={RenderError}>
				<Provider store={store}>
					<Router>
						<App />
					</Router>
				</Provider>
			</ErrorBoundary>
			// </React.StrictMode>
		);
	}
} catch (error) {
	console.error(`%c 系统故障, 请联系管理员!`);
}
