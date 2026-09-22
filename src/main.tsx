import './index.css';
import store from '@/store';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { ERROR_STYLE, ERROR_TIPS } from '@/core';
import { GlobalRouter } from '@/router';

// 应用挂载节点
const $root = document.getElementById('root');

try {
	if ($root) {
		createRoot($root).render(
			<ErrorBoundary fallback={<p>ERROR</p>}>
				<Provider store={store}>
					<GlobalRouter />
				</Provider>
			</ErrorBoundary>
		);
	}
} catch (error) {
	console.error(`%c ${ERROR_TIPS}`, ERROR_STYLE);
}
