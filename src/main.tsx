import { CustomErrorBoundary } from '@/components';
import { ROUTES } from '@/router';
import store from '@/store';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

import '@/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Root element #root not found in index.html');
}

const fallbackRender = (props: FallbackProps) => {
	return <CustomErrorBoundary {...props} />;
};

createRoot(rootElement).render(
	<ErrorBoundary fallbackRender={fallbackRender}>
		<Provider store={store}>
			<RouterProvider router={ROUTES} />
		</Provider>
	</ErrorBoundary>
);
