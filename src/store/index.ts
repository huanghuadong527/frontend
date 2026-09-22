import { configureStore, type Action } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import root from './reducers/root';

export default configureStore<State, Action>({
	reducer: {
		root
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({})
});

export const useStore = useSelector.withTypes<State>();

export * from './reducers/root';
