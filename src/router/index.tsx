import { RouterProvider } from 'react-router';
import { GLOBAL_ROUTER } from './routes';

export const GlobalRouter = () => {
	return <RouterProvider router={GLOBAL_ROUTER} />;
};
