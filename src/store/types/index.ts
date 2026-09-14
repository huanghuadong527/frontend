export interface MenuProp {
	key: string;
	label: string;
	icon?: string;
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

export interface CoreState {
	token: string | undefined;
	user: UserProps | undefined;
	roles: string[];
	permissions: string[];
	menus: MenuProp[];
}

export interface SystemState {
	theme: string;
	// 当前选中一级菜单
	selectable: string | undefined;
	tabs: TabsProps[];
	config: ConfigProps | undefined;
}

export interface State {
	core: CoreState;
	system: SystemState;
}
