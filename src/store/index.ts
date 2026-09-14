import {
	type Action,
	configureStore,
	type Dispatch,
	type ThunkDispatch,
} from '@reduxjs/toolkit';
import {
	useDispatch as useReduxDispatch,
	useSelector,
} from 'react-redux';
import core from './core';
import system from './system';

export * from './core';
export * from './system';
export * from './types';

const store = configureStore({
	reducer: {
		core,
		system,
	},
});

export type State = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type CustomDispatch = ThunkDispatch<State, unknown, Action> &
	Dispatch<Action>;

export const useAppSelector = useSelector.withTypes<State>();

export const useAppDispatch = useReduxDispatch.withTypes<CustomDispatch>();

export default store;
