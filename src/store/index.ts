import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { State } from './types';

import epics from './epics';
import reducers from './reducers';

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
	reducer: reducers,
	middleware: [epicmiddleware, thunkMiddleware],
});

epicmiddleware.run(epics);

export * from './reducers';
export * from './types';

export const useAppSelector: TypedUseSelectorHook<State> = useSelector;
