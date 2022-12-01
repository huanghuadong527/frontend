export interface MenuProp {
	key: string;
	label: string;
	icon?: JSX.Element;
	path?: string;
	children?: MenuProp[];
}

export interface TabsProps {
	key: string;
}

export interface UserProps {
  [key: string]: any;
}

export interface ConfigProps {
	title?: string;
	favicon?: string;
	logo: string;
	miniLogo: string;
}

export interface State {
	theme: string;
	// 当前选中一级菜单
	selectable: string | undefined;
	token: string | undefined;
	user: UserProps | undefined;
	roles: string[];
	permissions: string[];
	menus: MenuProp[];
	tabs: TabsProps[];
	config: ConfigProps | undefined;
}

export const FETCH_RESOURCE = 'FETCH_RESOURCE';

export const FETCH_ERROR = 'FETCH_ERROR';

