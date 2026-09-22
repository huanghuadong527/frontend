/// <reference types="vite-plugin-svgr/client" />

type AnyObject = Record<PropertyKey, any>;

type CObject = Record<number | string, any>;

type Func = (...args: any[]) => void;

type StatusType = 'success' | 'warning' | 'info' | 'error';

interface BaseNode {
	children?: ReactNode;
}

interface RootState {
	token: string | null;
	tabs: string[];
	theme: string;
}

interface State {
	root: RootState;
}

interface Coordinate {
	x: number;
	y: number;
}

interface StatusOverlayProps {
	image?: ReactNode;
	description?: string;
	children?: ReactNode;
}

type TreeItemsType = AnyObject &
	import('@mui/x-tree-view').TreeViewDefaultItemModelProperties;
