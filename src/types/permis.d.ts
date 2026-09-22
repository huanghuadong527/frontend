interface UserProps {
	id: number | null;
	userName?: string;
	avatar?: string;
	accessToken?: string;
	admin?: boolean;
	createBy?: string;
	createTime?: string;
	dept?: CObject;
	deptId?: number;
	email?: string;
	loginDate?: string;
	loginIp?: string;
	nickName?: string;
	openId?: number;
	params?: CObject;
	phonenumber?: string;
	postIds?: number;
	remark?: string;
	roleId?: number;
	roleIds?: string[];
	roles?: CObject[];
	salt?: string;
	searchValue?: string;
	sex?: number;
	status?: number;
	updateBy?: string;
	updateTime?: string;
}

interface MenuProps {
	id: string;
	menuName: string;
	menuType: string;
	path: string;
	component: string;
	createBy: string;
	createTime: string;
	icon: string;
	isCache: number;
	isFrame: number;
	orderNum: number;
	params: CObject;
	parentId?: string;
	parentName: string;
	perms: string;
	query: CObject;
	remark: string;
	searchValue: string;
	status: number;
	updateBy: string;
	updateTime: string;
	visible: boolean;
	children: MenuProps[];
}

interface PermisContextType {
	user: UserProps;
	roles: string[];
	permissions: string[];
	menus: MenuProps[];
	menuTree: MenuProps[];
}
