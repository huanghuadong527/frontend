import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { UseStore } from './types';

import epics from './epics';
import * as common from '@/store/modules';
export * from './reducers';
export * from './types';

const epicmiddleware = createEpicMiddleware();

// https://redux.js.org/usage/writing-logic-thunks
const thunkMiddleware =
	({ dispatch, getState }: any) =>
	(next: any) =>
	(action: any) => {
		if (typeof action == 'function') {
			return action(dispatch, getState);
		}
		return next(action);
	};

export default configureStore({
	reducer: common,
	middleware: [epicmiddleware, thunkMiddleware],
});

epicmiddleware.run(epics);

export const useAppSelector: TypedUseSelectorHook<UseStore> = useSelector;
