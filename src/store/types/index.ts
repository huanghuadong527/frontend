export interface MenuProps {
	key: string;
	label: string;
	icon?: JSX.Element;
	path?: string;
	children?: MenuProps[];
}

export interface TabsProps {
	key: string;
}

export interface UserProps {
  [key: string]: any;
}

export interface State {
	// 当前选中一级菜单
	selectable: string | undefined;
	token: string | undefined;
	user: UserProps | undefined;
	roles: string[];
	permissions: string[];
	menus: MenuProps[];
	tabs: TabsProps[];
}

export const FETCH_RESOURCE = 'FETCH_RESOURCE';

export const FETCH_ERROR = 'FETCH_ERROR';

